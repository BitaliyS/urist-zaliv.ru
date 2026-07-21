<script lang="ts">
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import { categories } from '$lib/content/categories';
	import { absoluteUrl } from '$lib/seo/site';

	let { data } = $props();
	const articles = $derived(data.articles);
</script>

<svelte:head>
	<title>Карта сайта — Савинский Виталий</title>
	<meta
		name="description"
		content="HTML-карта сайта: главная, статьи о заливах квартир и категории блога."
	/>
	<link rel="canonical" href={absoluteUrl('/karta-sajta')} />
</svelte:head>

<SiteHeader />

<main class="section">
	<div class="container">
		<div class="breadcrumbs"><a href="/">Главная</a> → Карта сайта</div>
		<div class="section-heading">
			<div class="eyebrow">Навигация для людей и роботов</div>
			<h1>Карта сайта</h1>
			<p>Все основные разделы и статьи в одном списке.</p>
		</div>

		<nav class="map" aria-label="Карта сайта">
			<section>
				<h2>Основные страницы</h2>
				<ul>
					<li><a href="/">Главная — залив квартиры</a></li>
					<li>
						<a href="/yurist-po-zalivu-kvartiry">Юрист по заливу квартиры — взыскание ущерба</a>
					</li>
					<li><a href="/stati">Статьи</a></li>
					<li><a href="/karta-sajta">Карта сайта</a></li>
				</ul>
			</section>

			<section>
				<h2>Категории статей</h2>
				<ul>
					{#each categories as category}
						<li>
							<a href={`/stati/category/${category.slug}`}>{category.title}</a>
						</li>
					{/each}
				</ul>
			</section>

			<section>
				<h2>Статьи</h2>
				<ul>
					{#each articles as article}
						<li>
							<a href={`/stati/${article.slug}`}>{article.title}</a>
						</li>
					{/each}
				</ul>
			</section>
		</nav>
	</div>
</main>

<style>
	.map {
		display: grid;
		gap: 42px;
		border-top: 1px solid var(--line);
		padding-top: 36px;
	}

	.map h2 {
		margin: 0 0 16px;
		font-size: clamp(1.4rem, 2.5vw, 2rem);
	}

	.map ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 12px;
	}

	.map a {
		text-underline-offset: 3px;
	}
</style>
