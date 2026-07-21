<script lang="ts">
	import '../app.css';
	import CookieBanner from '$lib/components/CookieBanner.svelte';

	let { children, data } = $props();
</script>

<svelte:head>
	{#if data.seoNoindex}
		<meta name="robots" content="noindex,follow" />
	{/if}
</svelte:head>

{@render children()}
<CookieBanner />
