<script lang="ts">
	import { onMount } from 'svelte';
	import { landing } from '$lib/content/landing';
	import { formatRuPhone, isValidRuPhone } from '$lib/phone';
	import { reachGoal } from '$lib/metrika';
	import JsonLd from '$lib/seo/JsonLd.svelte';
	import { homeGraph } from '$lib/seo/schema';
	import { absoluteUrl } from '$lib/seo/site';

	let { data } = $props();

	const {
		meta,
		brand,
		contacts,
		nav,
		hero,
		tickerItems,
		emergency,
		situations,
		problem,
		about,
		process: processSection,
		cases,
		experts,
		payment,
		faq,
		articlesSection,
		consultation,
		footer,
		mobileBar
	} = landing;

	const { phoneDisplay, phoneHref, telegramHref, responseNote, telegramLabel } = contacts;
	const articles = $derived(data.featuredArticles);
	const form = consultation.form;
	const canonical = absoluteUrl('/');

	const homeSchema = homeGraph(faq.items.map((item) => ({ question: item.q, answer: item.a })));

	let formStarted = $state(false);
	let submitting = $state(false);
	let formStatus = $state<'idle' | 'success' | 'error' | 'invalid'>('idle');
	let phoneValue = $state('');
	let consentAccepted = $state(false);
	let tickerTrackEl: HTMLDivElement | undefined = $state();
	let tickerShift = $state(0);

	function onPhoneInput(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		phoneValue = formatRuPhone(input.value);
	}

	function measureTicker() {
		const firstGroup = tickerTrackEl?.querySelector('.running-group');
		if (!firstGroup) return;
		tickerShift = Math.ceil(firstGroup.getBoundingClientRect().width);
	}

	onMount(() => {
		measureTicker();
		const resizeObserver = new ResizeObserver(measureTicker);
		if (tickerTrackEl) resizeObserver.observe(tickerTrackEl);
		window.addEventListener('resize', measureTicker);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener('resize', measureTicker);
		};
	});

	async function submitLead(event: SubmitEvent) {
		event.preventDefault();
		if (!consentAccepted) return;
		submitting = true;
		formStatus = 'idle';
		const formEl = event.currentTarget as HTMLFormElement;
		const phoneField = formEl.elements.namedItem('phone') as HTMLInputElement | null;
		const phoneRaw = phoneValue || phoneField?.value || '';

		if (!isValidRuPhone(phoneRaw)) {
			formStatus = 'invalid';
			submitting = false;
			return;
		}

		try {
			const body = new FormData(formEl);
			body.set('phone', formatRuPhone(phoneRaw));
			const response = await fetch('/api/lead', {
				method: 'POST',
				body
			});

			if (!response.ok) throw new Error('Lead request failed');
			formStatus = 'success';
			formEl.reset();
			phoneValue = '';
			consentAccepted = false;
			reachGoal('lead_form_success');
		} catch {
			formStatus = 'error';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonical} />
	<meta property="og:locale" content="ru_RU" />
	<meta property="og:title" content={meta.ogTitle} />
	<meta property="og:description" content={meta.ogDescription} />
</svelte:head>

<JsonLd data={homeSchema} />

<header class="site-header">
	<div class="container header-inner">
		<a class="brand" href="/" aria-label={brand.ariaLabel}>
			<span class="brand-mark">{brand.mark}</span>
			<span><strong>{brand.name}</strong><small>{brand.tagline}</small></span>
		</a>
		<nav aria-label="Основная навигация">
			{#each nav as item}
				<a href={item.href}>{item.label}</a>
			{/each}
		</nav>
		<a class="header-phone" href={phoneHref} onclick={() => reachGoal('phone_click')}>
			{phoneDisplay}<small>{responseNote}</small>
		</a>
	</div>
</header>

<main>
	<section class="hero section--dark">
		<div class="hero-grid container">
			<div class="hero-copy">
				<div class="eyebrow eyebrow--hero">{hero.eyebrow}</div>
				<h1>{hero.titleBefore}<span>{hero.titleHighlight}</span>{hero.titleAfter}</h1>
				<p class="hero-lead">{hero.lead}</p>
				<div class="hero-actions">
					<a class="button" href="#consultation" onclick={() => reachGoal('hero_cta_click')}>
						{hero.primaryCta}
					</a>
					<a
						class="button button--outline"
						href={telegramHref}
						target="_blank"
						rel="noopener noreferrer"
						onclick={() => reachGoal('telegram_click')}
					>
						{hero.secondaryCta}
					</a>
				</div>
				<div class="trust-row">
					{#each hero.trust as item}
						<span><strong>{item.strong}</strong>{item.text}</span>
					{/each}
				</div>
			</div>

			<div class="hero-person">
				<div class="hero-badge">{@html hero.badge.replace('\n', '<br />')}</div>
				<figure class="portrait">
					<img
						src="/images/savinskiy.png"
						alt={hero.portraitAlt}
						width="427"
						height="640"
					/>
					<figcaption>
						<strong>{hero.portraitName}</strong>
						<small>{hero.portraitRole}</small>
					</figcaption>
				</figure>
				<blockquote>{hero.quote}</blockquote>
			</div>
		</div>
	</section>

	<div class="running-line" aria-hidden="true">
		<div
			class="running-track"
			class:is-ready={tickerShift > 0}
			style={`--ticker-shift: ${tickerShift}px; --ticker-duration: ${Math.max(12, tickerShift / 60)}s`}
			bind:this={tickerTrackEl}
		>
			{#each [0, 1, 2, 3] as copy (copy)}
				<div class="running-group">
					{#each tickerItems as item}
						<span>{item}</span>
						<i>✦</i>
					{/each}
				</div>
			{/each}
		</div>
	</div>

	<section class="emergency">
		<div class="container emergency-grid">
			<div>
				<span class="emergency-label">{emergency.label}</span>
				<h2>{emergency.title}</h2>
			</div>
			<ol>
				{#each emergency.steps as step, index}
					<li><span>{index + 1}</span>{step}</li>
				{/each}
			</ol>
			<a href="#consultation">{emergency.cta}</a>
		</div>
	</section>

	<section class="section" id="situations">
		<div class="container">
			<div class="section-heading">
				<div class="eyebrow">{situations.eyebrow}</div>
				<h2>{situations.title}</h2>
				<p>{situations.lead}</p>
			</div>
			<div class="scenario-grid">
				{#each situations.items as scenario}
					<article class="scenario-card">
						<span>{scenario.number}</span>
						<h3>{scenario.title}</h3>
						<p>{scenario.text}</p>
						<a href="#consultation" aria-label={`Оценить ситуацию: ${scenario.title}`}>{situations.cta}</a>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<section class="section section--dark problem-section">
		<div class="container problem-grid">
			<div>
				<div class="eyebrow">{problem.eyebrow}</div>
				<h2>{problem.title}</h2>
			</div>
			<div class="problem-copy">
				<p>{problem.text}</p>
				<div class="result-flow">
					{#each problem.flow as step, index}
						<div class="result-flow__item" class:is-final={index === problem.flow.length - 1}>
							<span class="result-flow__num">{String(index + 1).padStart(2, '0')}</span>
							<strong>{step}</strong>
						</div>
						{#if index < problem.flow.length - 1}
							<div class="result-flow__arrow" aria-hidden="true"></div>
						{/if}
					{/each}
				</div>
			</div>
		</div>
	</section>

	<section class="section about">
		<div class="container about-grid">
			<figure class="about-photo">
				<img
					src="/images/savinskiy-court.jpg"
					alt={about.photoAlt}
					width="1024"
					height="883"
				/>
			</figure>
			<div>
				<div class="eyebrow">{about.eyebrow}</div>
				<h2>{about.title}</h2>
				<p class="large-copy">{about.lead}</p>
				<ul class="about-stats">
					{#each about.stats as item}
						<li>{item}</li>
					{/each}
				</ul>
			</div>
		</div>
	</section>

	<section class="section process" id="process">
		<div class="container">
			<div class="section-heading">
				<div class="eyebrow">{processSection.eyebrow}</div>
				<h2>{processSection.title}</h2>
				<p>{processSection.lead}</p>
			</div>
			<div class="steps">
				{#each processSection.steps as step, index}
					<article class="step">
						<span>{String(index + 1).padStart(2, '0')}</span>
						<div><h3>{step.title}</h3><p>{step.text}</p></div>
					</article>
				{/each}
			</div>
		</div>
	</section>

	<section class="section cases" id="cases">
		<div class="container">
			<div class="section-heading">
				<div class="eyebrow">{cases.eyebrow}</div>
				<h2>{cases.title}</h2>
			</div>
			<div class="case-grid">
				{#each cases.items as item}
					<article class="case-card">
						<div class="case-top">
							<span>{item.tag}</span>
							{#if item.amount}
								<strong>{item.amount}</strong>
							{/if}
						</div>
						<h3>{item.title}</h3>
						<p>{item.text}</p>
						{#if item.breakdown.length}
							<ul class="case-breakdown">
								{#each item.breakdown as row}
									<li>
										<span>{row.label}</span>
										<strong>{row.value}</strong>
									</li>
								{/each}
							</ul>
						{:else if item.note}
							<small>{item.note}</small>
						{/if}
					</article>
				{/each}
			</div>
			<div class="stats">
				{#each cases.stats as stat}
					<div><strong>{stat.value}</strong><span>{stat.label}</span></div>
				{/each}
			</div>
		</div>
	</section>

	<section class="section experts">
		<div class="container experts-grid">
			<div class="section-heading">
				<div class="eyebrow">{experts.eyebrow}</div>
				<h2>{experts.title}</h2>
				<p>{experts.lead}</p>
			</div>
			<div class="partner-list">
				{#each experts.partners as partner}
					<div class="partner-card">
						<img
							src={partner.src}
							alt={partner.alt}
							width={partner.width}
							height={partner.height}
						/>
						<strong>{partner.name}</strong>
						<small>{partner.role}</small>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<section class="section section--dark payment">
		<div class="container payment-grid">
			<div>
				<div class="eyebrow">{payment.eyebrow}</div>
				<h2>{payment.title}</h2>
			</div>
			<div>
				<p>{payment.lead}</p>
				<ul>
					{#each payment.points as point}
						<li>{point}</li>
					{/each}
				</ul>
				<a class="button" href="#consultation">{payment.cta}</a>
			</div>
		</div>
	</section>

	<section class="section" id="faq">
		<div class="container faq-grid">
			<div class="section-heading">
				<div class="eyebrow">{faq.eyebrow}</div>
				<h2>{faq.title}</h2>
			</div>
			<div class="faq-list">
				{#each faq.items as item}
					<details>
						<summary>{item.q}<span>+</span></summary>
						<p>{item.a}</p>
					</details>
				{/each}
			</div>
		</div>
	</section>

	<section class="section articles">
		<div class="container">
			<div class="articles-head">
				<div class="section-heading">
					<div class="eyebrow">{articlesSection.eyebrow}</div>
					<h2>{articlesSection.title}</h2>
				</div>
				<a href="/stati">{articlesSection.allLink}</a>
			</div>
			<div class="article-grid">
				{#each articles as article}
					<a class="article-card" href={`/stati/${article.slug}`} onclick={() => reachGoal('article_open')}>
						<small>{article.time}</small>
						<h3>{article.title}</h3>
						<p>{article.description}</p>
						<span>{articlesSection.cardCta}</span>
					</a>
				{/each}
			</div>
		</div>
	</section>

	<section class="consultation section--dark" id="consultation">
		<div class="container consultation-grid">
			<div>
				<div class="eyebrow">{consultation.eyebrow}</div>
				<h2>{consultation.title}</h2>
				<p>{consultation.lead}</p>
				<div class="direct-links">
					<a href={phoneHref} onclick={() => reachGoal('phone_click')}>{phoneDisplay}</a>
					<a
						href={telegramHref}
						target="_blank"
						rel="noopener noreferrer"
						onclick={() => reachGoal('telegram_click')}
					>
						{telegramLabel}
					</a>
				</div>
			</div>
			<form
				onsubmit={submitLead}
				onfocusin={() => {
					if (!formStarted) {
						formStarted = true;
						reachGoal('lead_form_start');
					}
				}}
			>
				<label class="honeypot" aria-hidden="true">
					<span>Компания</span>
					<input name="company" tabindex="-1" autocomplete="off" />
				</label>
				<label>
					<span>{form.nameLabel}</span>
					<input name="name" autocomplete="name" required placeholder={form.namePlaceholder} />
				</label>
				<label>
					<span>{form.phoneLabel}</span>
					<input
						name="phone"
						type="tel"
						inputmode="tel"
						autocomplete="tel"
						required
						placeholder={form.phonePlaceholder}
						bind:value={phoneValue}
						oninput={onPhoneInput}
						maxlength="18"
					/>
				</label>
				<label>
					<span>{form.messageLabel}</span>
					<textarea name="message" rows="4" placeholder={form.messagePlaceholder}></textarea>
				</label>
				<label class="consent">
					<input name="consent" type="checkbox" value="yes" bind:checked={consentAccepted} required />
					<span
						>{form.consentPrefix}<a href="/politika-konfidencialnosti">{form.consentLink}</a></span
					>
				</label>
				<button class="button" type="submit" disabled={submitting || !consentAccepted}>
					{submitting ? form.submitting : form.submit}
				</button>
				{#if formStatus === 'success'}
					<p class="form-message success">{form.success}</p>
				{:else if formStatus === 'invalid'}
					<p class="form-message error">{form.invalidPhone}</p>
				{:else if formStatus === 'error'}
					<p class="form-message error">{form.error}</p>
				{/if}
			</form>
		</div>
	</section>
</main>

<footer>
	<div class="container footer-grid">
		<a class="brand" href="/">
			<span class="brand-mark">{brand.mark}</span>
			<span><strong>{brand.name}</strong><small>{brand.footerTagline}</small></span>
		</a>
		<div>
			<strong>{footer.region}</strong>
			<p>{footer.role}</p>
		</div>
		<div>
			{#each footer.links as link}
				<a href={link.href}>{link.label}</a>
			{/each}
		</div>
	</div>
	<div class="container footer-note">
		<p>{footer.disclaimer}</p>
	</div>
</footer>

<div class="mobile-bar">
	<a href={phoneHref} onclick={() => reachGoal('phone_click')}>{mobileBar.call}</a>
	<a href="#consultation">{mobileBar.cta}</a>
</div>

<style>
	.site-header {
		position: sticky;
		z-index: 20;
		top: 0;
		border-bottom: 1px solid rgba(244, 240, 231, 0.12);
		background: rgba(16, 27, 32, 0.96);
		color: var(--paper);
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
		border: 1px solid var(--gold);
		color: var(--gold-light);
		font-family: var(--serif);
	}

	.brand strong,
	.brand small,
	.header-phone small {
		display: block;
	}

	.brand strong {
		font-family: var(--serif);
		font-size: 0.95rem;
		font-weight: 400;
	}

	.brand small,
	.header-phone small {
		color: rgba(244, 240, 231, 0.56);
		font-size: 0.64rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	nav {
		display: flex;
		gap: 26px;
	}

	nav a {
		color: rgba(244, 240, 231, 0.75);
		font-size: 0.82rem;
		text-decoration: none;
	}

	.header-phone {
		color: var(--paper);
		font-size: 0.9rem;
		font-weight: 700;
		text-align: right;
		text-decoration: none;
	}

	.hero {
		position: relative;
		overflow: hidden;
		padding: clamp(70px, 9vw, 130px) 0 100px;
	}

	.hero::after {
		position: absolute;
		top: -30%;
		right: -12%;
		width: 620px;
		height: 620px;
		border: 1px solid rgba(185, 149, 82, 0.17);
		border-radius: 50%;
		box-shadow: 0 0 0 90px rgba(185, 149, 82, 0.025), 0 0 0 180px rgba(185, 149, 82, 0.02);
		content: '';
	}

	.hero-grid {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.65fr);
		align-items: end;
		gap: clamp(48px, 8vw, 110px);
	}

	.hero h1 {
		max-width: 850px;
		margin-bottom: 28px;
	}

	.hero-lead {
		max-width: 720px;
		color: rgba(244, 240, 231, 0.76);
		font-size: clamp(1.05rem, 2vw, 1.32rem);
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin: 38px 0 50px;
	}

	.trust-row {
		display: flex;
		flex-wrap: wrap;
		gap: 28px;
		color: rgba(244, 240, 231, 0.62);
		font-size: 0.78rem;
	}

	.trust-row strong {
		display: block;
		color: var(--paper);
		font-family: var(--serif);
		font-size: 1.2rem;
		font-weight: 400;
	}

	.hero-person {
		border-top: 1px solid rgba(185, 149, 82, 0.55);
		padding-top: 24px;
	}

	.portrait {
		position: relative;
		margin: 0;
		overflow: hidden;
		border: 1px solid var(--ink);
		border-radius: 46% 46% 18px 18px;
		background: #d7d0c5;
		box-shadow: 16px 18px 0 var(--ink);
	}

	.portrait img {
		width: 100%;
		height: min(480px, 58vh);
		object-fit: cover;
		object-position: center top;
	}

	.portrait figcaption {
		position: absolute;
		right: 14px;
		bottom: 14px;
		left: 14px;
		border-radius: 16px;
		background: rgba(245, 242, 236, 0.94);
		padding: 14px;
	}

	.portrait strong,
	.portrait small {
		display: block;
	}

	.portrait small {
		color: var(--muted);
	}

	blockquote {
		margin: 24px 0 0;
		color: rgba(244, 240, 231, 0.72);
		font-family: var(--serif);
		font-size: 1.08rem;
	}

	.emergency {
		background: var(--gold);
		padding: 38px 0;
	}

	.emergency-grid {
		display: grid;
		grid-template-columns: 1fr 1.15fr auto;
		align-items: center;
		gap: 40px;
	}

	.emergency h2 {
		margin: 5px 0 0;
		font-family: var(--sans);
		font-size: 1.1rem;
		font-weight: 700;
	}

	.emergency-label {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.emergency ol {
		display: grid;
		gap: 7px;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 0.84rem;
	}

	.emergency li {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.emergency li span {
		display: grid;
		width: 22px;
		height: 22px;
		place-items: center;
		border: 1px solid var(--ink);
		border-radius: 50%;
		font-size: 0.65rem;
	}

	.emergency a {
		font-weight: 700;
		white-space: nowrap;
		text-underline-offset: 4px;
	}

	.scenario-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		border-top: 1px solid var(--line);
		border-left: 1px solid var(--line);
	}

	.scenario-card {
		min-height: 330px;
		border-right: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
		padding: 28px;
	}

	.scenario-card > span {
		color: var(--gold);
		font-family: var(--serif);
		font-size: 0.8rem;
	}

	.scenario-card h3 {
		margin-top: 72px;
	}

	.scenario-card a {
		font-size: 0.84rem;
		font-weight: 700;
		text-underline-offset: 4px;
	}

	.problem-grid,
	.about-grid,
	.experts-grid,
	.payment-grid,
	.faq-grid,
	.consultation-grid {
		display: grid;
		grid-template-columns: 0.85fr 1.15fr;
		gap: clamp(50px, 10vw, 140px);
	}

	.problem-grid h2 {
		margin: 0;
	}

	.problem-copy > p {
		max-width: 660px;
		font-size: 1.2rem;
	}

	.result-flow {
		display: grid;
		gap: 0;
		margin-top: 44px;
		max-width: 420px;
	}

	.result-flow__item {
		display: grid;
		grid-template-columns: 64px 1fr;
		align-items: center;
		gap: 16px;
		border: 2px solid rgba(255, 255, 255, 0.85);
		border-radius: 18px;
		background: rgba(0, 0, 0, 0.18);
		padding: 16px 18px;
	}

	.result-flow__item.is-final {
		background: var(--gold-light);
		border-color: var(--ink);
		color: var(--ink);
	}

	.result-flow__num {
		display: grid;
		width: 48px;
		height: 48px;
		place-items: center;
		border-radius: 50%;
		background: var(--ink);
		color: var(--gold-light);
		font-size: 0.82rem;
		font-weight: 800;
	}

	.result-flow__item.is-final .result-flow__num {
		background: var(--ink);
		color: var(--gold-light);
	}

	.result-flow__item strong {
		font-size: clamp(1.15rem, 2vw, 1.55rem);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.15;
	}

	.result-flow__arrow {
		width: 4px;
		height: 22px;
		margin: 2px 0 2px 30px;
		border-radius: 999px;
		background: var(--gold-light);
	}

	.about-photo {
		margin: 0;
		overflow: hidden;
		border: 1px solid var(--ink);
		border-radius: 28px;
		background: #ddd6cb;
		box-shadow: 14px 14px 0 var(--ink);
		transform: rotate(-2deg);
	}

	.about-photo img {
		width: 100%;
		height: 100%;
		min-height: 420px;
		object-fit: cover;
		object-position: center top;
	}

	.large-copy {
		font-size: 1.25rem;
	}

	.about-stats {
		display: grid;
		gap: 12px;
		margin: 34px 0 0;
		padding: 0;
		list-style: none;
	}

	.about-stats li {
		border: 1px solid var(--ink);
		border-radius: 16px;
		background: var(--paper);
		box-shadow: 5px 5px 0 var(--ink);
		padding: 16px 18px;
		font-weight: 700;
	}

	.process {
		background: var(--paper-deep);
	}

	.steps {
		border-top: 1px solid var(--line);
	}

	.step {
		display: grid;
		grid-template-columns: 100px 1fr;
		border-bottom: 1px solid var(--line);
		padding: 30px 0;
	}

	.step > span {
		color: var(--gold);
		font-family: var(--serif);
	}

	.step div {
		display: grid;
		grid-template-columns: 0.8fr 1.2fr;
		gap: 50px;
	}

	.step h3,
	.step p {
		margin: 0;
	}

	.case-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 18px;
	}

	.case-card {
		display: flex;
		min-height: 380px;
		flex-direction: column;
		border: 1px solid var(--line);
		background: var(--white);
		padding: 28px;
	}

	.case-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 20px;
		margin-bottom: 70px;
	}

	.case-top span {
		color: var(--muted);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.case-top strong {
		color: var(--gold);
		font-family: var(--serif);
		font-weight: 400;
		white-space: nowrap;
	}

	.case-card small {
		margin-top: auto;
		color: rgba(255, 255, 255, 0.68);
	}

	.case-breakdown {
		display: grid;
		gap: 8px;
		margin: auto 0 0;
		padding: 14px;
		list-style: none;
		border: 1px solid rgba(255, 255, 255, 0.35);
		border-radius: 16px;
		background: rgba(0, 0, 0, 0.28);
	}

	.case-breakdown li {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		padding-bottom: 8px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.18);
		font-size: 0.92rem;
	}

	.case-breakdown li:last-child {
		padding-bottom: 0;
		border-bottom: 0;
	}

	.case-breakdown span {
		color: rgba(255, 255, 255, 0.72);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.case-breakdown strong {
		color: var(--gold-light);
		font-family: var(--sans);
		font-size: 1.05rem;
		font-weight: 800;
		white-space: nowrap;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		margin-top: 24px;
		border: 1px solid var(--line);
	}

	.stats div {
		padding: 30px;
		border-right: 1px solid var(--line);
	}

	.stats div:last-child {
		border: 0;
	}

	.stats strong,
	.stats span {
		display: block;
	}

	.stats strong {
		font-family: var(--serif);
		font-size: 2rem;
		font-weight: 400;
	}

	.stats span {
		color: var(--muted);
		font-size: 0.8rem;
	}

	.experts {
		background: var(--white);
	}

	.partner-list {
		display: grid;
		gap: 14px;
	}

	.partner-card {
		display: grid;
		gap: 8px;
		border: 1px solid var(--ink);
		border-radius: 18px;
		background: var(--white);
		box-shadow: 5px 5px 0 var(--ink);
		padding: 18px;
	}

	.partner-card img {
		width: min(100%, 260px);
		height: 72px;
		object-fit: contain;
		object-position: left center;
		background: #0f3b34;
		border-radius: 12px;
		padding: 10px 14px;
	}

	.partner-card:first-child img {
		background: #2aa8a0;
	}

	.partner-card small {
		color: var(--muted);
	}

	.payment ul {
		margin: 30px 0;
		padding: 0;
		list-style: none;
	}

	.payment li {
		border-top: 1px solid rgba(244, 240, 231, 0.18);
		padding: 12px 0;
	}

	.faq-list {
		border-top: 1px solid var(--line);
	}

	details {
		border-bottom: 1px solid var(--line);
	}

	summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		padding: 24px 0;
		font-family: var(--serif);
		font-size: 1.18rem;
		cursor: pointer;
		list-style: none;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	summary span {
		color: var(--gold);
		font-family: var(--sans);
		font-size: 1.4rem;
	}

	details[open] summary span {
		transform: rotate(45deg);
	}

	details p {
		max-width: 690px;
		padding-bottom: 24px;
	}

	.articles {
		background: var(--paper-deep);
	}

	.articles-head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 30px;
	}

	.articles-head > a {
		margin-bottom: 50px;
		font-weight: 700;
		text-underline-offset: 4px;
	}

	.article-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 18px;
	}

	.article-card {
		display: flex;
		min-height: 330px;
		flex-direction: column;
		border: 1px solid var(--line);
		background: var(--paper);
		padding: 28px;
		text-decoration: none;
		transition: transform 180ms ease;
	}

	.article-card:hover {
		transform: translateY(-4px);
	}

	.article-card small {
		color: var(--gold);
	}

	.article-card h3 {
		margin-top: 50px;
	}

	.article-card span {
		margin-top: auto;
		font-size: 0.82rem;
		font-weight: 700;
	}

	.consultation {
		padding: clamp(80px, 11vw, 150px) 0;
	}

	.consultation h2 {
		font-size: clamp(2.5rem, 6vw, 5rem);
	}

	.direct-links {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
		margin-top: 40px;
	}

	.direct-links a {
		color: var(--gold-light);
		font-weight: 700;
		text-underline-offset: 4px;
	}

	form {
		display: grid;
		gap: 18px;
		border-top: 1px solid var(--gold);
		padding-top: 26px;
	}

	.honeypot {
		position: absolute;
		left: -10000px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	label > span {
		display: block;
		margin-bottom: 6px;
		color: rgba(244, 240, 231, 0.7);
		font-size: 0.76rem;
	}

	input,
	textarea {
		width: 100%;
		border: 0;
		border-bottom: 1px solid rgba(244, 240, 231, 0.25);
		border-radius: 0;
		background: transparent;
		color: var(--paper);
		padding: 12px 0;
	}

	input::placeholder,
	textarea::placeholder {
		color: rgba(244, 240, 231, 0.32);
	}

	.consent {
		display: flex;
		align-items: flex-start;
		gap: 10px;
	}

	.consent input {
		width: 16px;
		margin-top: 5px;
	}

	.consent span {
		font-size: 0.7rem;
	}

	.form-message {
		margin: 0;
		font-size: 0.8rem;
	}

	.form-message.success {
		color: #9fd6c8;
	}

	.form-message.error {
		color: #efaaa1;
	}

	footer {
		background: #0a1215;
		color: var(--paper);
		padding: 55px 0 30px;
	}

	.footer-grid {
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		gap: 40px;
	}

	.footer-grid p,
	.footer-note p {
		color: rgba(244, 240, 231, 0.48);
		font-size: 0.72rem;
	}

	.footer-grid > div:last-child {
		display: flex;
		flex-direction: column;
		gap: 8px;
		font-size: 0.8rem;
	}

	.footer-note {
		margin-top: 45px;
		padding-top: 20px;
		border-top: 1px solid rgba(244, 240, 231, 0.1);
	}

	.mobile-bar {
		display: none;
	}

	@media (max-width: 980px) {
		nav {
			display: none;
		}

		.hero-grid,
		.problem-grid,
		.about-grid,
		.experts-grid,
		.payment-grid,
		.faq-grid,
		.consultation-grid {
			grid-template-columns: 1fr;
		}

		.hero-person {
			max-width: 500px;
		}

		.emergency-grid {
			grid-template-columns: 1fr 1fr;
		}

		.emergency-grid > a {
			grid-column: 2;
		}

		.scenario-grid,
		.case-grid,
		.article-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.scenario-card:last-child,
		.article-card:last-child {
			grid-column: 1 / -1;
		}

		.about-photo {
			min-height: 280px;
			transform: none;
		}

		.about-photo img {
			min-height: 280px;
		}
	}

	@media (max-width: 720px) {
		.header-inner {
			min-height: 68px;
		}

		.header-phone {
			display: none;
		}

		.hero {
			padding-top: 62px;
		}

		.hero-grid {
			grid-template-columns: 1fr;
			gap: 28px;
		}

		.hero-actions {
			display: grid;
		}

		.hero-person {
			display: none;
		}

		.trust-row {
			display: grid;
			grid-template-columns: 1fr;
			gap: 14px;
		}

		.trust-row span {
			display: flex;
			align-items: baseline;
			gap: 8px;
		}

		.trust-row strong {
			display: inline;
			font-size: 1rem;
		}

		.emergency-grid,
		.scenario-grid,
		.case-grid,
		.stats,
		.article-grid,
		.footer-grid {
			grid-template-columns: 1fr;
		}

		.emergency-grid > a {
			grid-column: auto;
		}

		.scenario-card,
		.case-card,
		.article-card {
			min-height: auto;
		}

		.scenario-card h3,
		.article-card h3 {
			margin-top: 38px;
		}

		.problem-grid {
			gap: 18px;
		}

		.step {
			grid-template-columns: 48px 1fr;
		}

		.step div {
			grid-template-columns: 1fr;
			gap: 5px;
		}

		.stats div {
			border-right: 0;
			border-bottom: 1px solid var(--line);
		}

		.stats div:last-child {
			border-bottom: 0;
		}

		.articles-head {
			display: block;
		}

		.articles-head > a {
			display: inline-block;
			margin: -20px 0 36px;
		}

		.article-card:last-child {
			grid-column: auto;
		}

		.mobile-bar {
			position: fixed;
			z-index: 30;
			right: 0;
			bottom: 0;
			left: 0;
			display: grid;
			grid-template-columns: 0.65fr 1.35fr;
			background: var(--ink);
			box-shadow: 0 -10px 30px rgba(16, 27, 32, 0.18);
		}

		.mobile-bar a {
			display: grid;
			min-height: 54px;
			place-items: center;
			border-top: 1px solid rgba(244, 240, 231, 0.15);
			color: var(--paper);
			font-size: 0.78rem;
			font-weight: 700;
			text-decoration: none;
		}

		.mobile-bar a:last-child {
			background: var(--gold);
			color: var(--ink);
		}
	}

	/* Art direction: editorial, asymmetrical and deliberately non-corporate */
	.site-header {
		border-bottom: 1px solid var(--ink);
		background: rgba(245, 242, 236, 0.94);
		color: var(--ink);
	}

	.brand-mark {
		border: 1px solid var(--ink);
		border-radius: 50%;
		background: var(--gold-light);
		color: var(--ink);
		font-family: var(--sans);
		font-size: 0.72rem;
		font-weight: 800;
	}

	.brand strong {
		font-family: var(--sans);
		font-weight: 800;
	}

	.brand small,
	.header-phone small {
		color: var(--muted);
	}

	nav a {
		color: var(--ink-soft);
		font-weight: 700;
	}

	.header-phone {
		color: var(--ink);
	}

	.hero {
		min-height: calc(100svh - 78px);
		background:
			radial-gradient(circle at 85% 18%, rgba(105, 71, 245, 0.14) 0 10%, transparent 10.3%),
			linear-gradient(135deg, #f5f2ec 0 68%, #e6ddff 68%);
		color: var(--ink);
		padding: clamp(64px, 7vw, 100px) 0 76px;
	}

	.hero::after {
		top: auto;
		right: -8vw;
		bottom: -25vw;
		width: 50vw;
		height: 50vw;
		border: 0;
		border-radius: 48% 52% 43% 57%;
		background: var(--gold-light);
		box-shadow: none;
		opacity: 0.52;
		transform: rotate(17deg);
	}

	.hero-grid {
		grid-template-columns: minmax(0, 1.5fr) minmax(330px, 0.5fr);
		align-items: center;
		gap: clamp(34px, 6vw, 84px);
	}

	.hero h1 {
		max-width: 990px;
		margin: 22px 0 32px;
		font-size: clamp(3.4rem, 7.2vw, 7.2rem);
		line-height: 0.92;
	}

	.hero h1 span {
		position: relative;
		z-index: 0;
		display: inline-block;
		color: var(--paper);
		-webkit-text-stroke: 2px var(--ink);
		paint-order: stroke fill;
		text-shadow:
			-1.5px 0 0 var(--ink),
			1.5px 0 0 var(--ink),
			0 -1.5px 0 var(--ink),
			0 1.5px 0 var(--ink);
		white-space: nowrap;
	}

	.hero h1 span::before {
		position: absolute;
		z-index: -1;
		inset: 4% -2% -2%;
		border-radius: 50% 44% 52% 45%;
		background: var(--gold);
		content: '';
		transform: rotate(-1.5deg);
	}

	.hero-lead {
		max-width: 680px;
		color: var(--ink-soft);
		font-size: clamp(1.05rem, 1.5vw, 1.28rem);
	}

	.hero-actions .button:first-child {
		padding-inline: 32px;
	}

	.hero-actions .button--outline {
		border-color: var(--ink);
		color: var(--ink);
	}

	.trust-row {
		max-width: 690px;
		color: var(--muted);
	}

	.trust-row strong {
		color: var(--ink);
		font-family: var(--sans);
		font-weight: 800;
	}

	.hero-person {
		position: relative;
		border: 0;
		padding: 0;
		transform: rotate(2deg);
	}

	.hero-badge {
		position: absolute;
		z-index: 2;
		top: -35px;
		right: -20px;
		display: grid;
		width: 128px;
		height: 128px;
		place-items: center;
		border: 1px solid var(--ink);
		border-radius: 50%;
		background: var(--gold-light);
		font-size: 0.68rem;
		font-weight: 800;
		line-height: 1.2;
		text-align: center;
		text-transform: uppercase;
		transform: rotate(9deg);
	}

	.eyebrow--hero {
		border-color: var(--ink);
		background: var(--gold-light);
		color: var(--ink);
		box-shadow: 4px 4px 0 var(--ink);
	}

	.portrait {
		position: relative;
		min-height: auto;
		overflow: hidden;
		border: 1px solid var(--ink);
		border-radius: 46% 46% 18px 18px;
		background: #d7d0c5;
		box-shadow: 16px 18px 0 var(--ink);
	}

	.portrait img {
		width: 100%;
		height: min(480px, 58vh);
		object-fit: cover;
		object-position: center 12%;
	}

	.portrait figcaption {
		position: absolute;
		right: 14px;
		bottom: 14px;
		left: 14px;
		border-radius: 16px;
		background: rgba(245, 242, 236, 0.94);
		color: var(--ink);
		padding: 14px;
	}

	blockquote {
		margin-top: 34px;
		color: var(--ink-soft);
		font-family: var(--sans);
		font-size: 0.94rem;
		font-weight: 600;
	}

	.running-line {
		position: relative;
		left: 50%;
		width: 100vw;
		overflow: hidden;
		margin-left: -50vw;
		border-block: 1px solid var(--ink);
		background: var(--gold);
		color: var(--paper);
		padding: 13px 0;
	}

	.running-track {
		display: flex;
		width: max-content;
		will-change: transform;
	}

	.running-track.is-ready {
		animation: ticker var(--ticker-duration, 18s) linear infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.running-track,
		.running-track.is-ready {
			animation: none;
			will-change: auto;
			transform: none;
		}
	}

	.running-group {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 1.25rem;
		padding-right: 1.25rem;
		font-size: 0.8rem;
		font-weight: 800;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.running-group i {
		color: var(--gold-light);
		font-style: normal;
	}

	@keyframes ticker {
		from {
			transform: translate3d(0, 0, 0);
		}
		to {
			transform: translate3d(calc(-1 * var(--ticker-shift)), 0, 0);
		}
	}

	.emergency {
		background: var(--gold-light);
		color: var(--ink);
		padding: 46px 0 38px;
	}

	.emergency li span {
		background: var(--ink);
		color: var(--paper);
	}

	.scenario-grid {
		grid-template-columns: repeat(12, 1fr);
		gap: 18px;
		border: 0;
	}

	.scenario-card {
		min-height: 330px;
		border: 1px solid var(--ink);
		border-radius: 28px;
		background: var(--white);
		box-shadow: 7px 7px 0 var(--ink);
		padding: 28px;
		transition: transform 180ms ease;
	}

	.scenario-card:hover {
		transform: translateY(-7px) rotate(-1deg);
	}

	.scenario-card:nth-child(1),
	.scenario-card:nth-child(4) {
		grid-column: span 7;
	}

	.scenario-card:nth-child(2),
	.scenario-card:nth-child(3) {
		grid-column: span 5;
	}

	.scenario-card:nth-child(2) {
		background: var(--paper-deep);
		transform: translateY(32px) rotate(1deg);
	}

	.scenario-card:nth-child(2):hover {
		transform: translateY(18px) rotate(-1deg);
	}

	.scenario-card:nth-child(3) {
		background: #ffd7dd;
	}

	.scenario-card:nth-child(4) {
		background: #e9ddff;
		transform: translateY(32px);
	}

	.scenario-card:nth-child(4):hover {
		transform: translateY(18px) rotate(-1deg);
	}

	.scenario-card > span {
		display: grid;
		width: 42px;
		height: 42px;
		place-items: center;
		border-radius: 50%;
		background: var(--ink);
		color: var(--paper);
		font-family: var(--sans);
		font-weight: 800;
	}

	.scenario-card h3 {
		max-width: 460px;
		margin-top: 58px;
		font-size: clamp(1.7rem, 3vw, 2.8rem);
	}

	.problem-section {
		background: var(--gold);
		color: var(--paper);
	}

	.problem-section .eyebrow,
	.problem-section p {
		color: var(--paper);
	}

	.problem-grid h2 {
		font-size: clamp(3rem, 7vw, 7rem);
	}

	.result-flow {
		margin-top: 44px;
	}

	.result-flow__item {
		border: 2px solid rgba(255, 255, 255, 0.92);
		background: rgba(0, 0, 0, 0.22);
	}

	.result-flow__item.is-final {
		background: var(--gold-light);
		border-color: var(--ink);
		color: var(--ink);
		box-shadow: 6px 6px 0 var(--ink);
	}

	.result-flow__item strong {
		color: inherit;
		font-family: var(--sans);
		font-weight: 800;
		white-space: normal;
	}

	.result-flow__arrow {
		background: var(--gold-light);
	}

	.about {
		background: var(--white);
	}

	.about-photo {
		min-height: 480px;
		border: 1px solid var(--ink);
		border-radius: 28px;
		background: #ddd6cb;
		box-shadow: 14px 14px 0 var(--ink);
		transform: rotate(-2deg);
	}

	.about-photo img {
		min-height: 480px;
	}

	.process {
		background: var(--paper);
	}

	.steps {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 14px;
		border: 0;
	}

	.step {
		grid-template-columns: 52px 1fr;
		border: 1px solid var(--ink);
		border-radius: 22px;
		background: var(--white);
		padding: 26px;
	}

	.step:nth-child(3n + 2) {
		background: var(--paper-deep);
	}

	.step:nth-child(3n) {
		background: #e9ddff;
	}

	.step > span {
		color: var(--gold);
		font-family: var(--sans);
		font-weight: 800;
	}

	.step div {
		grid-template-columns: 1fr;
		gap: 12px;
	}

	.case-grid {
		align-items: stretch;
		gap: 14px;
	}

	.case-card {
		border: 1px solid var(--ink);
		border-radius: 30px;
		background: var(--ink);
		color: var(--paper);
	}

	.case-card p {
		color: rgba(255, 255, 255, 0.7);
	}

	.case-card:nth-child(2) {
		background: var(--gold);
		transform: translateY(28px) rotate(1deg);
	}

	.case-card:nth-child(3) {
		background: #2f5cff;
	}

	.case-top span,
	.case-card small {
		color: rgba(255, 255, 255, 0.68);
	}

	.case-top strong {
		color: var(--gold-light);
		font-family: var(--sans);
		font-weight: 800;
	}

	.stats {
		margin-top: 54px;
		overflow: hidden;
		border: 1px solid var(--ink);
		border-radius: 24px;
		background: var(--gold-light);
	}

	.stats strong {
		font-family: var(--sans);
		font-weight: 800;
	}

	.experts {
		background: var(--paper-deep);
	}

	.partner-card {
		display: grid;
		gap: 8px;
		border: 1px solid var(--ink);
		border-radius: 18px;
		background: var(--white);
		box-shadow: 5px 5px 0 var(--ink);
		padding: 18px;
	}

	.partner-card img {
		width: min(100%, 280px);
		height: 78px;
		object-fit: contain;
		object-position: left center;
		border-radius: 12px;
		padding: 10px 14px;
	}

	.partner-card:first-child img {
		background: #2aa8a0;
	}

	.partner-card:last-child img {
		background: #0f3b34;
	}

	.payment {
		background:
			radial-gradient(circle at 15% 90%, rgba(223, 255, 88, 0.19), transparent 25%),
			var(--ink);
	}

	.payment h2 {
		color: var(--gold-light);
	}

	.payment li {
		position: relative;
		padding-left: 26px;
	}

	.payment li::before {
		position: absolute;
		left: 0;
		color: var(--gold-light);
		content: '✦';
	}

	details {
		border: 1px solid var(--line);
		border-radius: 18px;
		background: var(--white);
		margin-bottom: 10px;
		padding-inline: 20px;
	}

	.articles {
		background: #e8deff;
	}

	.article-card {
		border: 1px solid var(--ink);
		border-radius: 28px;
		background: var(--white);
		box-shadow: 7px 7px 0 var(--ink);
	}

	.article-card:nth-child(2) {
		background: var(--gold-light);
		transform: rotate(1.5deg);
	}

	.consultation {
		background: var(--gold);
	}

	.consultation .eyebrow,
	.consultation p,
	.consultation label > span {
		color: var(--paper);
	}

	.consultation form {
		border: 1px solid var(--ink);
		border-radius: 30px;
		background: var(--paper);
		box-shadow: 12px 12px 0 var(--ink);
		padding: 30px;
	}

	.consultation form label > span {
		color: var(--ink-soft);
	}

	.consultation input,
	.consultation textarea {
		border-bottom-color: var(--line);
		color: var(--ink);
	}

	.consultation input::placeholder,
	.consultation textarea::placeholder {
		color: var(--muted);
	}

	.direct-links a {
		color: var(--gold-light);
	}

	footer {
		background: var(--ink);
	}

	@media (max-width: 980px) {
		.hero-grid {
			grid-template-columns: 1fr 0.55fr;
		}

		.hero h1 {
			font-size: clamp(3rem, 8.5vw, 5.7rem);
		}

		.portrait img {
			height: 390px;
		}

		.scenario-card:nth-child(n) {
			grid-column: span 6;
		}
	}

	@media (max-width: 720px) {
		.hero {
			min-height: auto;
			background: linear-gradient(155deg, var(--paper) 0 78%, #e6ddff 78%);
		}

		.hero-grid {
			grid-template-columns: 1fr;
		}

		.hero h1 {
			font-size: clamp(2.55rem, 11vw, 4.2rem);
		}

		.hero h1 span {
			white-space: normal;
		}

		.hero-person {
			display: block;
			max-width: min(340px, 92%);
			margin: 8px auto 8px;
			transform: none;
		}

		.portrait img {
			height: 320px;
		}

		.portrait figcaption {
			background: rgba(245, 242, 236, 0.97);
		}

		.hero-badge {
			top: -12px;
			right: 8px;
			width: 96px;
			height: 96px;
			font-size: 0.55rem;
		}

		.running-group {
			font-size: 0.74rem;
		}

		.scenario-grid,
		.steps {
			display: grid;
			grid-template-columns: 1fr;
		}

		.scenario-card:nth-child(n) {
			grid-column: auto;
			transform: none;
		}

		.scenario-card:nth-child(n):hover {
			transform: translateY(-7px) rotate(-1deg);
		}

		.about-photo {
			min-height: 300px;
			transform: none;
		}

		.about-photo img {
			min-height: 300px;
		}

		.case-card:nth-child(2) {
			transform: none;
		}

		.consultation form {
			padding: 22px;
		}

		.mobile-bar a:last-child {
			background: var(--gold-light);
		}

		.result-flow__item strong {
			font-size: 1.05rem;
		}

		.problem-grid h2 {
			font-size: clamp(2.3rem, 11vw, 3.4rem);
		}
	}

	@media (max-width: 420px) {
		.hero h1 {
			font-size: clamp(2.35rem, 12vw, 3.2rem);
		}

		.hero-badge {
			right: 4px;
			width: 88px;
			height: 88px;
			font-size: 0.5rem;
		}

		.eyebrow--hero {
			font-size: 0.58rem;
			padding: 6px 10px;
			max-width: 100%;
			white-space: normal;
			line-height: 1.35;
			height: auto;
			border-radius: 16px;
			overflow-wrap: normal;
			word-break: normal;
		}
	}
</style>
