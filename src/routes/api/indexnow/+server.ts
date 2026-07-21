import { articles } from '$lib/content/articles';
import { categories } from '$lib/content/categories';
import { env } from '$env/dynamic/private';
import { submitIndexNow } from '$lib/seo/indexnow';
import { absoluteUrl } from '$lib/seo/site';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * POST /api/indexnow
 * Body: { "urls": ["/stati/slug", ...] } or empty body to submit all public pages.
 * Optional header: x-indexnow-secret matching INDEXNOW_SECRET.
 */
export const POST: RequestHandler = async ({ request }) => {
	const secret = env.INDEXNOW_SECRET;
	if (secret) {
		const provided = request.headers.get('x-indexnow-secret');
		if (provided !== secret) error(401, 'Unauthorized');
	}

	let urls: string[] = [];
	const contentType = request.headers.get('content-type') || '';
	if (contentType.includes('application/json')) {
		const body = (await request.json().catch(() => ({}))) as { urls?: string[] };
		if (Array.isArray(body.urls) && body.urls.length) urls = body.urls;
	}

	if (!urls.length) {
		urls = [
			'/',
			'/stati',
			'/karta-sajta',
			...categories.map((c) => `/stati/category/${c.slug}`),
			...articles.map((a) => `/stati/${a.slug}`)
		];
	}

	const result = await submitIndexNow(urls.map((u) => absoluteUrl(u)));
	return json(result, { status: result.ok ? 200 : 502 });
};
