import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { hasCookieConsent } from './consent';

type YmQueue = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };

let loading = false;
let loaded = false;

function metricId(): number {
	return Number(env.PUBLIC_YANDEX_METRIKA_ID || 0);
}

function webvisorEnabled(): boolean {
	return env.PUBLIC_YANDEX_WEBVISOR === 'true';
}

/** Подключает Яндекс.Метрику только после согласия на cookie. */
export function loadMetrikaIfConsented(): void {
	if (!browser || loaded || loading) return;
	if (!hasCookieConsent()) return;

	const id = metricId();
	if (!id) return;

	loading = true;

	if (!window.ym) {
		const ym: YmQueue = function (...args: unknown[]) {
			ym.a ||= [];
			ym.a.push(args);
		};
		ym.l = Date.now();
		window.ym = ym as Window['ym'];

		const script = document.createElement('script');
		script.async = true;
		script.src = 'https://mc.yandex.ru/metrika/tag.js';
		document.head.appendChild(script);
	}

	window.ym?.(id, 'init', {
		clickmap: true,
		trackLinks: true,
		accurateTrackBounce: true,
		webvisor: webvisorEnabled()
	});

	loaded = true;
	loading = false;
}

export function reachGoal(goal: string, params?: Record<string, unknown>): void {
	if (!browser || !hasCookieConsent()) return;
	const id = metricId();
	if (!id || !window.ym) return;
	window.ym(id, 'reachGoal', goal, params);
}
