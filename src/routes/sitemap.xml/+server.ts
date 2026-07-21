import { articles } from '$lib/content/articles';
import { categories } from '$lib/content/categories';
import { absoluteUrl } from '$lib/seo/site';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	const today = new Date().toISOString().slice(0, 10);
	const pages = [
		{ path: '/', priority: '1.0', changefreq: 'weekly', lastmod: today },
		{ path: '/yurist-po-zalivu-kvartiry', priority: '0.95', changefreq: 'weekly', lastmod: today },
		{ path: '/stati', priority: '0.8', changefreq: 'weekly', lastmod: today },
		{ path: '/karta-sajta', priority: '0.4', changefreq: 'weekly', lastmod: today },
		...categories.map((category) => ({
			path: `/stati/category/${category.slug}`,
			priority: '0.5',
			changefreq: 'weekly' as const,
			lastmod: today
		})),
		...articles.map((article) => ({
			path: `/stati/${article.slug}`,
			priority: '0.7',
			changefreq: 'monthly' as const,
			lastmod: article.updated
		}))
	];

	const urls = pages
		.map(
			(page) => `<url>
	<loc>${absoluteUrl(page.path)}</loc>
	<lastmod>${page.lastmod}</lastmod>
	<changefreq>${page.changefreq}</changefreq>
	<priority>${page.priority}</priority>
</url>`
		)
		.join('\n');

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`,
		{ headers: { 'content-type': 'application/xml; charset=utf-8' } }
	);
};
