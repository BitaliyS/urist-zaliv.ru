import { env } from '$env/dynamic/private';
import type { LeadPayload } from './lead-mail';

export function ntfyConfigured(): boolean {
	return Boolean(env.NTFY_TOPIC?.trim());
}

export async function sendLeadNtfy(payload: LeadPayload): Promise<void> {
	const topic = env.NTFY_TOPIC?.trim();
	if (!topic) throw new Error('NTFY_TOPIC not configured');

	const base = (env.NTFY_URL || 'https://ntfy.sh').replace(/\/$/, '');
	const url = `${base}/${encodeURIComponent(topic)}`;

	const headers: Record<string, string> = {
		'Content-Type': 'text/plain; charset=utf-8',
		Title: `Заявка urist-zaliv.ru: ${payload.name}`,
		Tags: 'incoming_envelope',
		Priority: '4'
	};

	const token = env.NTFY_TOKEN?.trim();
	if (token) headers.Authorization = `Bearer ${token}`;

	const body = [
		`Имя: ${payload.name}`,
		`Телефон: ${payload.phone}`,
		`Ситуация: ${payload.message}`,
		`IP: ${payload.ip}`
	].join('\n');

	const response = await fetch(url, { method: 'POST', headers, body });
	if (!response.ok) {
		throw new Error(`ntfy HTTP ${response.status}`);
	}
}
