import { env } from '$env/dynamic/public';

/** Canonical origin without trailing slash. */
export function getSiteUrl(): string {
	return (env.PUBLIC_SITE_URL || 'https://urist-zaliv.ru').replace(/\/$/, '');
}

/** Absolute URL for a path starting with `/`. */
export function absoluteUrl(path = '/'): string {
	const site = getSiteUrl();
	if (!path || path === '/') return `${site}/`;
	return `${site}${path.startsWith('/') ? path : `/${path}`}`;
}

export const TRACKING_PARAM_PREFIXES = ['utm_'] as const;

export const TRACKING_PARAMS = [
	'from',
	'yclid',
	'gclid',
	'fbclid',
	'ysclid',
	'_openstat',
	'utm_source',
	'utm_medium',
	'utm_campaign',
	'utm_content',
	'utm_term'
] as const;

export function hasTrackingParams(searchParams: URLSearchParams): boolean {
	for (const key of searchParams.keys()) {
		if (TRACKING_PARAMS.includes(key as (typeof TRACKING_PARAMS)[number])) return true;
		if (TRACKING_PARAM_PREFIXES.some((prefix) => key.startsWith(prefix))) return true;
	}
	return false;
}
