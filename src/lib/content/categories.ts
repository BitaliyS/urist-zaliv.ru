export type Category = {
	slug: string;
	title: string;
	description: string;
};

/** Blog categories — latin lowercase slugs only (SEO rule). */
export const categories: Category[] = [
	{
		slug: 'chto-delat-pri-zalive',
		title: 'Что делать при заливе',
		description: 'Пошаговые инструкции для пострадавшего и виновника после залива квартиры.'
	},
	{
		slug: 'uk-i-obshchedomovoe',
		title: 'УК и общедомовое имущество',
		description: 'Кто отвечает за стояки, кровлю и общедомовые сети при заливе.'
	},
	{
		slug: 'akt-o-zalive',
		title: 'Акт о заливе',
		description: 'Как правильно оформить акт о заливе квартиры и что в нем должно быть.'
	},
	{
		slug: 'ocenka-i-ekspertiza',
		title: 'Оценка и экспертиза',
		description: 'Независимая экспертиза и оценка ущерба после залива для претензии и суда.'
	},
	{
		slug: 'vozmeshchenie-i-kompensaciya',
		title: 'Возмещение и компенсация',
		description: 'Претензии, суммы и порядок возмещения ущерба от залива.'
	},
	{
		slug: 'sud-i-isk',
		title: 'Суд и иск',
		description: 'Исковое заявление, подсудность и судебная практика по заливам.'
	},
	{
		slug: 'moralnyy-vred',
		title: 'Моральный вред',
		description: 'Когда и сколько можно взыскать моральный вред при заливе квартиры.'
	},
	{
		slug: 'strakhovanie',
		title: 'Страхование',
		description: 'Залив при отсутствии страховки и споры со страховой.'
	},
	{
		slug: 'remont',
		title: 'Ремонт после залива',
		description: 'Смета ремонта и взыскание, если восстановительные работы уже начаты.'
	},
	{
		slug: 'zaliv-s-kryshi',
		title: 'Залив с крыши',
		description: 'Кто возмещает ущерб при протечке кровли и заливе с крыши.'
	}
];

export const getCategory = (slug: string) => categories.find((category) => category.slug === slug);
