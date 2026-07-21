import { getArticle } from '$lib/content/articles';
import { landing } from '$lib/content/landing';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const featuredArticles = landing.articlesSection.featuredSlugs
		.map((slug) => getArticle(slug))
		.filter((article): article is NonNullable<typeof article> => Boolean(article))
		.map((article) => ({
			slug: article.slug,
			title: article.title,
			description: article.description,
			time: article.readingTime
		}));

	return { featuredArticles };
};
