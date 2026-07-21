import { getArticle } from '$lib/content/articles';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const article = getArticle(params.slug);
	if (!article) error(404, 'Статья не найдена');

	return { article };
};
