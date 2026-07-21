import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

export type LeadPayload = {
	name: string;
	phone: string;
	message: string;
	ip: string;
};

function smtpConfigured(): boolean {
	return Boolean(
		env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && (env.LEAD_NOTIFY_TO || env.SMTP_USER)
	);
}

export function leadNotifyConfigured(): boolean {
	return smtpConfigured();
}

export async function sendLeadEmail(payload: LeadPayload): Promise<void> {
	if (!smtpConfigured()) {
		throw new Error('SMTP not configured');
	}

	const port = Number(env.SMTP_PORT || 465);
	const secure = env.SMTP_SECURE !== 'false' && port === 465;
	const to = env.LEAD_NOTIFY_TO || env.SMTP_USER!;

	const transporter = nodemailer.createTransport({
		host: env.SMTP_HOST,
		port,
		secure,
		auth: {
			user: env.SMTP_USER,
			pass: env.SMTP_PASS
		}
	});

	const text = [
		'Новая заявка с сайта urist-zaliv.ru',
		'',
		`Имя: ${payload.name}`,
		`Телефон: ${payload.phone}`,
		`Ситуация: ${payload.message || 'не указана'}`,
		`IP: ${payload.ip}`,
		'',
		`Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`
	].join('\n');

	await transporter.sendMail({
		from: env.SMTP_FROM || `Сайт urist-zaliv.ru <${env.SMTP_USER}>`,
		to,
		subject: `Заявка с сайта: ${payload.name}, ${payload.phone}`,
		text
	});
}
