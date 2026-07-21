import { error } from '@sveltejs/kit';
import { getIndexNowKey } from '$lib/seo/indexnow';
import type { RequestHandler } from './$types';

/** Serves the IndexNow ownership key at /{key}.txt — only the configured key. */
export const GET: RequestHandler = ({ params }) => {
	const key = getIndexNowKey();
	if (params.key !== key) error(404, 'Not found');

	return new Response(key, {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=86400'
		}
	});
};
