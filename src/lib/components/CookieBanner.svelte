<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { hasCookieConsent, setCookieConsent } from '$lib/consent';
	import { loadMetrikaIfConsented } from '$lib/metrika';

	let visible = $state(false);

	onMount(() => {
		visible = !hasCookieConsent();
		if (!visible) loadMetrikaIfConsented();
	});

	function accept() {
		setCookieConsent();
		visible = false;
		loadMetrikaIfConsented();
	}
</script>

{#if browser && visible}
	<div
		class="cookie-banner"
		role="dialog"
		aria-labelledby="cookie-banner-title"
		aria-live="polite"
	>
		<div class="cookie-banner__card">
			<p id="cookie-banner-title">
				Cookie и Метрика.
				<a href="/politika-konfidencialnosti">Политика</a>
			</p>
			<button type="button" class="cookie-banner__btn" onclick={accept}>Принять</button>
		</div>
	</div>
{/if}

<style>
	.cookie-banner {
		position: fixed;
		z-index: 100;
		left: 10px;
		right: 10px;
		bottom: 10px;
		display: flex;
		justify-content: center;
		pointer-events: none;
	}

	.cookie-banner__card {
		pointer-events: auto;
		display: flex;
		max-width: 420px;
		width: auto;
		align-items: center;
		gap: 8px;
		border: 1px solid var(--ink);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.96);
		box-shadow: 2px 2px 0 var(--ink);
		backdrop-filter: blur(8px);
		padding: 5px 5px 5px 12px;
	}

	.cookie-banner__card p {
		margin: 0;
		color: var(--ink-soft);
		font-size: 0.7rem;
		line-height: 1.25;
		white-space: nowrap;
	}

	.cookie-banner__card a {
		font-weight: 700;
		color: var(--ink);
		text-underline-offset: 2px;
	}

	.cookie-banner__btn {
		flex-shrink: 0;
		height: 28px;
		min-width: 78px;
		padding: 0 14px;
		border: 1px solid var(--ink);
		border-radius: 999px;
		background: var(--gold-light);
		color: var(--ink);
		font: inherit;
		font-size: 0.68rem;
		font-weight: 800;
		cursor: pointer;
	}

	.cookie-banner__btn:hover {
		filter: brightness(0.97);
	}

	@media (max-width: 720px) {
		.cookie-banner {
			left: 8px;
			right: 8px;
			bottom: calc(8px + env(safe-area-inset-bottom, 0px));
		}

		/* Над нижней CTA-панелью, только если она есть */
		:global(body:has(.mobile-bar)) .cookie-banner {
			bottom: calc(58px + env(safe-area-inset-bottom, 0px));
		}

		.cookie-banner__card {
			max-width: none;
			width: 100%;
			justify-content: space-between;
			padding: 4px 4px 4px 11px;
			box-shadow: 1px 1px 0 var(--ink);
		}

		.cookie-banner__card p {
			font-size: 0.66rem;
			white-space: normal;
		}

		.cookie-banner__btn {
			height: 26px;
			min-width: 68px;
			padding: 0 10px;
			font-size: 0.66rem;
		}
	}
</style>
