<script lang="ts">
	import { landing } from '$lib/content/landing';

	const { brand, contacts, nav } = landing;

	const navItems = nav.map((item) => ({
		...item,
		href: item.href.startsWith('#') ? `/${item.href}` : item.href
	}));
</script>

<header class="site-header">
	<div class="container header-inner">
		<a class="brand" href="/" aria-label={brand.ariaLabel}>
			<span class="brand-mark">{brand.mark}</span>
			<span>
				<strong>{brand.name}</strong>
				<small>{brand.tagline}</small>
			</span>
		</a>
		<nav aria-label="Основная навигация">
			{#each navItems as item}
				<a href={item.href}>{item.label}</a>
			{/each}
		</nav>
		<a class="header-phone" href={contacts.phoneHref}>
			{contacts.phoneDisplay}
			<small>{contacts.responseNote}</small>
		</a>
	</div>
</header>

<style>
	.site-header {
		position: sticky;
		z-index: 20;
		top: 0;
		border-bottom: 1px solid var(--ink);
		background: rgba(245, 242, 236, 0.94);
		color: var(--ink);
		backdrop-filter: blur(14px);
	}

	.header-inner {
		display: flex;
		min-height: 78px;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		color: inherit;
		text-decoration: none;
	}

	.brand-mark {
		display: grid;
		width: 42px;
		height: 42px;
		place-items: center;
		border: 1px solid var(--ink);
		border-radius: 50%;
		background: var(--gold-light);
		color: var(--ink);
		font-family: var(--sans);
		font-size: 0.72rem;
		font-weight: 800;
	}

	.brand strong,
	.brand small,
	.header-phone small {
		display: block;
	}

	.brand strong {
		font-family: var(--sans);
		font-size: 0.95rem;
		font-weight: 800;
	}

	.brand small,
	.header-phone small {
		color: var(--muted);
		font-size: 0.64rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	nav {
		display: flex;
		gap: 26px;
	}

	nav a {
		color: var(--ink-soft);
		font-size: 0.82rem;
		font-weight: 700;
		text-decoration: none;
	}

	.header-phone {
		color: var(--ink);
		font-size: 0.9rem;
		font-weight: 700;
		text-align: right;
		text-decoration: none;
	}

	@media (max-width: 980px) {
		nav {
			display: none;
		}
	}

	@media (max-width: 680px) {
		.header-inner {
			min-height: 64px;
			gap: 12px;
		}

		.brand small,
		.header-phone small {
			display: none;
		}

		.header-phone {
			font-size: 0.78rem;
		}
	}
</style>
