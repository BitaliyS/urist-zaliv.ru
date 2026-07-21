import { error } from '@sveltejs/kit';
import { getArticleCardsByCategory } from '$lib/content/articles';
import { getCategory } from '$lib/content/categories';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const category = getCategory(params.slug);
	if (!category) error(404, 'Категория не найдена');

	return {
		category,
		articles: getArticleCardsByCategory(category.slug)
	};
};
