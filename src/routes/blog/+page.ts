import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

/** Alias for checklist / habit: /blog → /stati */
export const load: PageLoad = () => {
	redirect(301, '/stati');
};
