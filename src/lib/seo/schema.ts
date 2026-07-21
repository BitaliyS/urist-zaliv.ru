import type { Article } from '$lib/content/articles';
import { landing } from '$lib/content/landing';
import { absoluteUrl, getSiteUrl } from './site';

export type JsonLd = Record<string, unknown>;

const SITE_NAME = 'Савинский Виталий — юрист по заливам';
const PERSON_NAME = 'Савинский Виталий';
const PERSON_JOB = 'Юрист';
const LOGO_PATH = '/images/savinskiy.png';
const DEFAULT_IMAGE_PATH = '/images/savinskiy.png';
const PHONE = '+7-980-216-90-81';

export function personSchema(extra: JsonLd = {}): JsonLd {
	return {
		'@type': 'Person',
		'@id': `${getSiteUrl()}/#person`,
		name: PERSON_NAME,
		jobTitle: PERSON_JOB,
		url: absoluteUrl('/'),
		image: absoluteUrl(LOGO_PATH),
		worksFor: { '@id': `${getSiteUrl()}/#organization` },
		...extra
	};
}

export function organizationSchema(): JsonLd {
	const site = getSiteUrl();
	return {
		'@type': 'Organization',
		'@id': `${site}/#organization`,
		name: SITE_NAME,
		url: absoluteUrl('/'),
		logo: {
			'@type': 'ImageObject',
			'@id': `${site}/#logo`,
			url: absoluteUrl(LOGO_PATH),
			contentUrl: absoluteUrl(LOGO_PATH),
			caption: PERSON_NAME
		},
		image: absoluteUrl(LOGO_PATH),
		founder: { '@id': `${site}/#person` },
		telephone: PHONE,
		areaServed: [
			{ '@type': 'City', name: 'Санкт-Петербург' },
			{ '@type': 'AdministrativeArea', name: 'Ленинградская область' }
		]
	};
}

export function websiteSchema(): JsonLd {
	const site = getSiteUrl();
	return {
		'@type': 'WebSite',
		'@id': `${site}/#website`,
		url: absoluteUrl('/'),
		name: SITE_NAME,
		inLanguage: 'ru-RU',
		publisher: { '@id': `${site}/#organization` },
		about: { '@id': `${site}/#person` }
	};
}

export function legalServiceSchema(): JsonLd {
	const site = getSiteUrl();
	return {
		'@type': 'LegalService',
		'@id': `${site}/#legalservice`,
		name: 'Юрист по заливам квартир — Савинский Виталий',
		description:
			'Юридическая помощь по взысканию ущерба после залива квартиры в Санкт-Петербурге и Ленинградской области.',
		url: absoluteUrl('/'),
		image: absoluteUrl(DEFAULT_IMAGE_PATH),
		provider: { '@id': `${site}/#person` },
		areaServed: ['Санкт-Петербург', 'Ленинградская область'],
		priceRange: 'По результатам оценки дела',
		telephone: PHONE
	};
}

export function webPageSchema(input: {
	path: string;
	name: string;
	description: string;
	type?: string;
	includeAboutService?: boolean;
}): JsonLd {
	const url = absoluteUrl(input.path);
	const site = getSiteUrl();
	return {
		'@type': input.type ?? 'WebPage',
		'@id': `${url}#webpage`,
		url,
		name: input.name,
		description: input.description,
		inLanguage: 'ru-RU',
		isPartOf: { '@id': `${site}/#website` },
		publisher: { '@id': `${site}/#organization` },
		...(input.includeAboutService
			? { about: { '@id': `${site}/#legalservice` } }
			: {})
	};
}

export function breadcrumbListSchema(
	items: Array<{ name: string; path: string }>
): JsonLd {
	return {
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: absoluteUrl(item.path)
		}))
	};
}

export function faqPageSchema(
	items: Array<{ question: string; answer: string }>,
	pageUrl?: string
): JsonLd | null {
	if (!items.length) return null;
	return {
		'@type': 'FAQPage',
		...(pageUrl ? { '@id': `${pageUrl}#faq`, url: pageUrl } : {}),
		mainEntity: items.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: item.answer
			}
		}))
	};
}

export function imageObjectSchema(input: {
	url: string;
	caption?: string;
	width?: number;
	height?: number;
}): JsonLd {
	const site = getSiteUrl();
	return {
		'@type': 'ImageObject',
		url: input.url,
		contentUrl: input.url,
		caption: input.caption ?? PERSON_NAME,
		author: { '@id': `${site}/#person` },
		creditText: PERSON_NAME,
		copyrightNotice: PERSON_NAME,
		...(input.width ? { width: input.width } : {}),
		...(input.height ? { height: input.height } : {})
	};
}

export function itemListSchema(
	items: Array<{ name: string; path: string; description?: string }>,
	opts?: { name?: string; id?: string }
): JsonLd {
	return {
		'@type': 'ItemList',
		...(opts?.name ? { name: opts.name } : {}),
		...(opts?.id ? { '@id': opts.id } : {}),
		numberOfItems: items.length,
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			url: absoluteUrl(item.path),
			...(item.description ? { description: item.description } : {}),
			item: absoluteUrl(item.path)
		}))
	};
}

export function collectionPageSchema(input: {
	path: string;
	name: string;
	description: string;
}): JsonLd {
	return {
		...webPageSchema({
			path: input.path,
			name: input.name,
			description: input.description,
			type: 'CollectionPage'
		})
	};
}

/** HowTo only when article has explicit numbered "Шаг N" sections. */
export function howToFromArticle(article: Article): JsonLd | null {
	const stepSections = article.sections.filter((section) =>
		/^Шаг\s*\d+/i.test(section.heading)
	);

	if (stepSections.length < 2) return null;

	return {
		'@type': 'HowTo',
		name: article.title,
		description: article.description,
		inLanguage: 'ru-RU',
		totalTime: readingTimeToIso(article.readingTime),
		step: stepSections.map((section) => ({
			'@type': 'HowToStep',
			name: section.heading,
			text: section.paragraphs?.[0] ?? section.items?.join(' ') ?? section.heading
		}))
	};
}

function readingTimeToIso(readingTime: string): string | undefined {
	const match = readingTime.match(/(\d+)/);
	if (!match) return undefined;
	return `PT${match[1]}M`;
}

export function blogPostingSchema(article: Article): JsonLd {
	const site = getSiteUrl();
	const url = absoluteUrl(`/stati/${article.slug}`);
	const imageUrl = absoluteUrl(DEFAULT_IMAGE_PATH);

	return {
		'@type': 'BlogPosting',
		'@id': `${url}#article`,
		headline: article.title,
		description: article.description,
		datePublished: article.published,
		dateModified: article.updated,
		inLanguage: 'ru-RU',
		mainEntityOfPage: {
			'@type': 'WebPage',
			'@id': `${url}#webpage`
		},
		url,
		author: personSchema(),
		publisher: {
			'@type': 'Organization',
			'@id': `${site}/#organization`,
			name: SITE_NAME,
			logo: {
				'@type': 'ImageObject',
				url: absoluteUrl(LOGO_PATH)
			}
		},
		image: imageObjectSchema({
			url: imageUrl,
			caption: article.title,
			width: 427,
			height: 640
		})
	};
}

/** Graph for homepage. */
export function homeGraph(faqs: Array<{ question: string; answer: string }>): JsonLd {
	const faq = faqPageSchema(faqs, absoluteUrl('/'));
	return {
		'@context': 'https://schema.org',
		'@graph': [
			organizationSchema(),
			personSchema(),
			websiteSchema(),
			legalServiceSchema(),
			webPageSchema({
				path: '/',
				name: landing.meta.title,
				description: landing.meta.description,
				includeAboutService: true
			}),
			...(faq ? [faq] : [])
		]
	};
}

/** Graph for /stati hub. */
export function statiHubGraph(
	articles: Array<{ title: string; slug: string; description: string }>
): JsonLd {
	const path = '/stati';
	const url = absoluteUrl(path);
	return {
		'@context': 'https://schema.org',
		'@graph': [
			organizationSchema(),
			websiteSchema(),
			collectionPageSchema({
				path,
				name: 'Статьи о заливах квартир',
				description:
					'Практические юридические инструкции: что делать после залива, как определить виновника, провести оценку и взыскать ущерб.'
			}),
			breadcrumbListSchema([
				{ name: 'Главная', path: '/' },
				{ name: 'Статьи', path }
			]),
			itemListSchema(
				articles.map((a) => ({
					name: a.title,
					path: `/stati/${a.slug}`,
					description: a.description
				})),
				{ name: 'Статьи о заливах', id: `${url}#itemlist` }
			)
		]
	};
}

/** Graph for category page. */
export function categoryGraph(input: {
	slug: string;
	title: string;
	description: string;
	articles: Array<{ title: string; slug: string; description: string }>;
}): JsonLd {
	const path = `/stati/category/${input.slug}`;
	const url = absoluteUrl(path);
	return {
		'@context': 'https://schema.org',
		'@graph': [
			organizationSchema(),
			websiteSchema(),
			collectionPageSchema({
				path,
				name: input.title,
				description: input.description
			}),
			breadcrumbListSchema([
				{ name: 'Главная', path: '/' },
				{ name: 'Статьи', path: '/stati' },
				{ name: input.title, path }
			]),
			...(input.articles.length
				? [
						itemListSchema(
							input.articles.map((a) => ({
								name: a.title,
								path: `/stati/${a.slug}`,
								description: a.description
							})),
							{ name: input.title, id: `${url}#itemlist` }
						)
					]
				: [])
		]
	};
}

/** Graph for a single article. */
export function articleGraph(
	article: Article,
	category?: { slug: string; title: string } | null
): JsonLd {
	const path = `/stati/${article.slug}`;
	const url = absoluteUrl(path);
	const crumbs = [
		{ name: 'Главная', path: '/' },
		{ name: 'Статьи', path: '/stati' },
		...(category
			? [{ name: category.title, path: `/stati/category/${category.slug}` }]
			: []),
		{ name: article.title, path }
	];

	const faq = faqPageSchema(
		article.faq.map((item) => ({ question: item.question, answer: item.answer })),
		url
	);
	const howTo = howToFromArticle(article);

	return {
		'@context': 'https://schema.org',
		'@graph': [
			organizationSchema(),
			personSchema(),
			websiteSchema(),
			webPageSchema({
				path,
				name: article.title,
				description: article.description
			}),
			breadcrumbListSchema(crumbs),
			blogPostingSchema(article),
			...(faq ? [faq] : []),
			...(howTo ? [howTo] : [])
		]
	};
}

/** Graph for privacy policy. */
export function privacyGraph(): JsonLd {
	const path = '/politika-konfidencialnosti';
	return {
		'@context': 'https://schema.org',
		'@graph': [
			organizationSchema(),
			websiteSchema(),
			webPageSchema({
				path,
				name: 'Политика обработки персональных данных',
				description:
					'Политика обработки персональных данных сайта юриста Савинского Виталия.'
			}),
			breadcrumbListSchema([
				{ name: 'Главная', path: '/' },
				{ name: 'Политика конфиденциальности', path }
			])
		]
	};
}
