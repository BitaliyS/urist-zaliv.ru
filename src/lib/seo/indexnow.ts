import { env } from '$env/dynamic/public';
import { absoluteUrl, getSiteUrl } from './site';

/** Public IndexNow key (hosted at /{key}.txt). */
export function getIndexNowKey(): string {
	return env.PUBLIC_INDEXNOW_KEY || 'b7e3f2a1c4d8490e8f1a2b3c4d5e6f70';
}

export function getIndexNowKeyPath(): string {
	return `/${getIndexNowKey()}.txt`;
}

/**
 * Notify IndexNow (Bing / Yandex) about URL changes.
 * Safe to call from server routes after publish/update.
 */
export async function submitIndexNow(urls: string[]): Promise<{ ok: boolean; status: number; body: string }> {
	const key = getIndexNowKey();
	const host = new URL(getSiteUrl()).host;
	const absoluteUrls = urls.map((url) => (url.startsWith('http') ? url : absoluteUrl(url)));

	const response = await fetch('https://api.indexnow.org/indexnow', {
		method: 'POST',
		headers: { 'content-type': 'application/json; charset=utf-8' },
		body: JSON.stringify({
			host,
			key,
			keyLocation: absoluteUrl(getIndexNowKeyPath()),
			urlList: absoluteUrls
		})
	});

	const body = await response.text();
	return { ok: response.ok, status: response.status, body };
}
