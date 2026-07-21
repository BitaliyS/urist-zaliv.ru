<script lang="ts">
	import { serializeJsonLd } from './json-ld';

	let { data }: { data: unknown } = $props();
</script>

<!--
  Свой svelte:head: вложенный {@html}<script> внутри чужого <svelte:head>
  ломает клиентскую навигацию (hydration / head reconciliation).
-->
<svelte:head>
	{@html `<script type="application/ld+json">${serializeJsonLd(data)}</script>`}
</svelte:head>
