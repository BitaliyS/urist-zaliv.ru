<script lang="ts">
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import JsonLd from '$lib/seo/JsonLd.svelte';
	import { categoryGraph } from '$lib/seo/schema';
	import { absoluteUrl } from '$lib/seo/site';

	let { data } = $props();
	const category = $derived(data.category);
	const list = $derived(data.articles);
	const schema = $derived(
		categoryGraph({
			slug: category.slug,
			title: category.title,
			description: category.description,
			articles: list.map((a) => ({
				title: a.title,
				slug: a.slug,
				description: a.description
			}))
		})
	);
</script>

<svelte:head>
	<title>{category.title} — статьи о заливах | Савинский Виталий</title>
	<meta name="description" content={category.description} />
	<link rel="canonical" href={absoluteUrl(`/stati/category/${category.slug}`)} />
</svelte:head>

<JsonLd data={schema} />

<SiteHeader />

<main class="section">
	<div class="container">
		<div class="breadcrumbs">
			<a href="/">Главная</a> → <a href="/stati">Статьи</a> → {category.title}
		</div>
		<div class="section-heading">
			<div class="eyebrow">Категория</div>
			<h1>{category.title}</h1>
			<p>{category.description}</p>
		</div>

		{#if list.length}
			<div class="article-list">
				{#each list as article}
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
		{:else}
			<p class="empty">
				В этой категории пока нет опубликованных статей. Материалы появятся по мере публикации.
			</p>
			<p><a href="/stati">Все статьи →</a></p>
		{/if}
	</div>
</main>

<style>
	h1 {
		max-width: 900px;
	}

	.empty {
		margin-top: 28px;
		color: var(--muted);
	}

	.article-list {
		border-top: 1px solid var(--line);
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
