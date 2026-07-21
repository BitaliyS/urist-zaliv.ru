<script lang="ts">
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import { categories } from '$lib/content/categories';
	import JsonLd from '$lib/seo/JsonLd.svelte';
	import { statiHubGraph } from '$lib/seo/schema';
	import { absoluteUrl } from '$lib/seo/site';

	let { data } = $props();
	const articles = $derived(data.articles);
	const schema = $derived(
		statiHubGraph(
			articles.map((a) => ({ title: a.title, slug: a.slug, description: a.description }))
		)
	);
</script>

<svelte:head>
	<title>Статьи о заливах квартир — юрист Савинский Виталий</title>
	<meta
		name="description"
		content="Практические юридические инструкции: что делать после залива, как определить виновника, провести оценку и взыскать ущерб."
	/>
	<link rel="canonical" href={absoluteUrl('/stati')} />
</svelte:head>

<JsonLd data={schema} />

<SiteHeader />

<main class="section">
	<div class="container">
		<div class="breadcrumbs"><a href="/">Главная</a> → Статьи</div>
		<div class="section-heading">
			<div class="eyebrow">Правовая база</div>
			<h1>Что делать после залива квартиры</h1>
			<p>
				Пошаговые материалы о фиксации ущерба, ответственности соседей и УК, экспертизе, суде
				и фактическом взыскании денег.
			</p>
		</div>

		<nav class="category-nav" aria-label="Категории статей">
			{#each categories as category}
				<a href={`/stati/category/${category.slug}`}>{category.title}</a>
			{/each}
		</nav>

		<div class="article-list">
			{#each articles as article}
				<a href={`/stati/${article.slug}`}>
					<div>
						<small>Проверено юристом · {article.readingTime}</small>
						<h2>{article.title}</h2>
						<p>{article.description}</p>
					</div>
					<span>Читать →</span>
				</a>
			{/each}
		</div>
	</div>
</main>

<style>
	h1 {
		max-width: 900px;
	}

	.category-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 10px;
		margin: 0 0 36px;
		padding-bottom: 28px;
		border-bottom: 1px solid var(--line);
	}

	.category-nav a {
		display: inline-flex;
		align-items: center;
		min-height: 36px;
		padding: 4px 2px;
		font-size: 0.86rem;
		text-underline-offset: 3px;
	}

	.article-list {
		border-top: 0;
	}

	.article-list > a {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 30px;
		border-bottom: 1px solid var(--line);
		padding: 38px 0;
		text-decoration: none;
	}

	.article-list h2 {
		max-width: 820px;
		margin: 12px 0;
		font-size: clamp(1.5rem, 3vw, 2.4rem);
	}

	.article-list p {
		max-width: 720px;
		margin: 0;
	}

	.article-list small {
		color: var(--gold);
	}

	.article-list > a > span {
		font-weight: 700;
	}

	@media (max-width: 600px) {
		.article-list > a {
			grid-template-columns: 1fr;
		}
	}
</style>
