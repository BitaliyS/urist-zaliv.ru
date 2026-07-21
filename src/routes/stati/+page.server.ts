import { getArticleCards } from '$lib/content/articles';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	articles: getArticleCards()
});
