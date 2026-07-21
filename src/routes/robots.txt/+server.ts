import { getIndexNowKeyPath } from '$lib/seo/indexnow';
import { absoluteUrl, TRACKING_PARAMS } from '$lib/seo/site';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	const cleanParams = TRACKING_PARAMS.join('&');
	const body = [
		'User-agent: *',
		'Allow: /',
		'Disallow: /api/',
		// Parametric tracking URLs must not be crawled as separate pages.
		'Disallow: /*?*utm_',
		'Disallow: /*?*from=',
		'Disallow: /*?*yclid=',
		'Disallow: /*?*gclid=',
		'Disallow: /*?*fbclid=',
		// Yandex: strip tracking params instead of indexing duplicates.
		`Clean-param: ${cleanParams}`,
		`Sitemap: ${absoluteUrl('/sitemap.xml')}`,
		`# IndexNow key: ${absoluteUrl(getIndexNowKeyPath())}`
	].join('\n');

	return new Response(body, {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
};
