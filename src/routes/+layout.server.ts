import { hasTrackingParams } from '$lib/seo/site';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ url }) => {
	return {
		seoNoindex: hasTrackingParams(url.searchParams),
		canonicalPath: url.pathname.endsWith('/') && url.pathname !== '/' ? url.pathname.slice(0, -1) : url.pathname
	};
};
