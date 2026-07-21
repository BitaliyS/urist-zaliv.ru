import { dev } from '$app/environment';
import { json, type RequestHandler } from '@sveltejs/kit';
import { formatRuPhone, isValidRuPhone } from '$lib/phone';
import { markLeadNotified, saveLead } from '$lib/server/lead-db';
import { leadNotifyConfigured, sendLeadEmail } from '$lib/server/lead-mail';
import { ntfyConfigured, sendLeadNtfy } from '$lib/server/lead-ntfy';

const clean = (value: FormDataEntryValue | null, max: number) =>
	String(value ?? '')
		.trim()
		.slice(0, max);

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const form = await request.formData();
	const name = clean(form.get('name'), 80);
	const phoneRaw = clean(form.get('phone'), 40);
	const message = clean(form.get('message'), 1200);
	const consent = form.get('consent') === 'yes';
	const honeypot = clean(form.get('company'), 100);

	if (honeypot) return json({ ok: true });
	if (!name || !isValidRuPhone(phoneRaw) || !consent) {
		return json({ ok: false, error: 'Проверьте обязательные поля' }, { status: 400 });
	}

	const phone = formatRuPhone(phoneRaw);

	const payload = {
		name,
		phone,
		message: message || 'не указана',
		ip: getClientAddress()
	};

	let leadId: number;
	try {
		leadId = saveLead(payload);
	} catch (error) {
		console.error('[lead db error]', error);
		return json({ ok: false, error: 'Не удалось сохранить заявку' }, { status: 502 });
	}

	const tasks: { channel: 'email' | 'ntfy'; run: () => Promise<void> }[] = [];

	if (leadNotifyConfigured()) {
		tasks.push({ channel: 'email', run: () => sendLeadEmail(payload) });
	} else if (dev) {
		console.warn('[lead] SMTP не настроен — письмо не отправлено');
	}

	if (ntfyConfigured()) {
		tasks.push({ channel: 'ntfy', run: () => sendLeadNtfy(payload) });
	} else if (dev) {
		console.warn('[lead] NTFY_TOPIC не задан — push не отправлен');
	}

	const results = await Promise.allSettled(tasks.map((task) => task.run()));

	results.forEach((result, index) => {
		const { channel } = tasks[index];
		if (result.status === 'fulfilled') {
			markLeadNotified(leadId, channel);
			return;
		}
		console.error(`[lead ${channel} error]`, result.reason);
	});

	// Заявка в БД — пользователю успех; email/ntfy дублируют и могут временно отвалиться
	return json({ ok: true });
};
