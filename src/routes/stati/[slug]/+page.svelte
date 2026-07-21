<script lang="ts">
	import { browser } from '$app/environment';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import { getCategory } from '$lib/content/categories';
	import { landing } from '$lib/content/landing';
	import { formatRuPhone, isValidRuPhone } from '$lib/phone';
	import JsonLd from '$lib/seo/JsonLd.svelte';
	import { articleGraph } from '$lib/seo/schema';
	import { absoluteUrl } from '$lib/seo/site';

	let { data } = $props();
	const article = $derived(data.article);
	const category = $derived(getCategory(article.category));
	const canonical = $derived(absoluteUrl(`/stati/${article.slug}`));
	const schema = $derived(articleGraph(article, category ?? null));

	const phoneDisplay = landing.contacts.phoneDisplay;
	const phoneHref = landing.contacts.phoneHref;
	const telegramHref = landing.contacts.telegramHref;

	let formStarted = $state(false);
	let submitting = $state(false);
	let formStatus = $state<'idle' | 'success' | 'error' | 'invalid'>('idle');
	let phoneValue = $state('');
	let consentAccepted = $state(false);
	const formCopy = landing.consultation.form;

	function introText(item: string | { text: string; highlight?: boolean }) {
		return typeof item === 'string' ? item : item.text;
	}

	function introHighlight(item: string | { text: string; highlight?: boolean }) {
		return typeof item !== 'string' && Boolean(item.highlight);
	}

	type TextPart = { type: 'text'; value: string } | { type: 'link'; text: string; href: string };

	function parseInlineLinks(text: string): TextPart[] {
		const parts: TextPart[] = [];
		const re = /\[([^\]]+)\]\(([^)]+)\)/g;
		let last = 0;
		let match: RegExpExecArray | null;
		while ((match = re.exec(text))) {
			if (match.index > last) parts.push({ type: 'text', value: text.slice(last, match.index) });
			parts.push({ type: 'link', text: match[1], href: match[2] });
			last = match.index + match[0].length;
		}
		if (last < text.length) parts.push({ type: 'text', value: text.slice(last) });
		return parts.length ? parts : [{ type: 'text', value: text }];
	}

	function onPhoneInput(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		phoneValue = formatRuPhone(input.value);
	}

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
		} catch {
			formStatus = 'error';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>{article.title} — Савинский Виталий</title>
	<meta name="description" content={article.description} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={article.title} />
	<meta property="og:description" content={article.description} />
	<meta property="og:image" content={absoluteUrl('/images/savinskiy.png')} />
	<meta property="article:published_time" content={article.published} />
	<meta property="article:modified_time" content={article.updated} />
</svelte:head>

<JsonLd data={schema} />

<SiteHeader />

<main class="article-shell">
	<nav class="breadcrumbs" aria-label="Хлебные крошки">
		<a href="/">Главная</a> →
		<a href="/stati">Статьи</a>
		{#if category}
			→ <a href={`/stati/category/${category.slug}`}>{category.title}</a>
		{/if}
		→ {article.title}
	</nav>

	<div class="eyebrow">Проверено юристом</div>
	<h1>{article.title}</h1>
	<p class="meta">
		Автор: Савинский Виталий, практикующий судебный юрист · Обновлено
		{new Date(article.updated).toLocaleDateString('ru-RU')} · {article.readingTime}
	</p>

	<div class="article-lead">
		<strong>Коротко</strong>
		<ul>
			{#each article.summary as item}<li>{item}</li>{/each}
		</ul>
	</div>

	{#if article.intro?.length}
		{#each article.intro as paragraph}
			<p class:intro-highlight={introHighlight(paragraph)}>{introText(paragraph)}</p>
		{/each}
	{/if}

	<aside class="inline-cta">
		<div>
			<strong>Не уверены, кто должен возмещать ущерб?</strong>
			<p>Бесплатно оценю документы и предложу порядок действий.</p>
		</div>
		<a class="button" href="#article-consultation">Оценить перспективы</a>
	</aside>

	{#each article.sections as section}
		<section>
			<h2>{section.heading}</h2>
			{#if section.callout}
				<aside class="doc-callout">
					<strong>{section.callout.title}</strong>
					<p>{section.callout.text}</p>
					<a class="button" href="#article-consultation">Оставить заявку</a>
				</aside>
			{/if}
			{#each section.paragraphs ?? [] as paragraph}
				<p>
					{#each parseInlineLinks(paragraph) as part}
						{#if part.type === 'link'}
							<a href={part.href}>{part.text}</a>
						{:else}
							{part.value}
						{/if}
					{/each}
				</p>
			{/each}
			{#if section.items}
				<ul>
					{#each section.items as item}<li>{item}</li>{/each}
				</ul>
			{/if}
			{#if section.risks?.length}
				<ul class="risk-list">
					{#each section.risks as risk}
						<li>
							<strong>{risk.title}.</strong>
							{risk.consequence}
						</li>
					{/each}
				</ul>
			{/if}
			{#if section.template}
				<div class="word-doc" role="region" aria-label={section.templateLabel ?? 'Шаблон документа'}>
					<div class="word-doc__bar">
						<span>Microsoft Word</span>
						<small>{section.templateLabel ?? 'Документ.docx'}</small>
					</div>
					<pre class="claim-template">{section.template}</pre>
				</div>
			{/if}
			{#if section.templateHint?.length}
				<ul>
					{#each section.templateHint as hint}<li>{hint}</li>{/each}
				</ul>
			{/if}
			{#if section.partners}
				<div class="article-partners" aria-label="Партнёры по экспертизе">
					{#each landing.experts.partners as partner}
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
			{/if}
		</section>
	{/each}

	{#if article.faq.length}
		<section>
			<h2>Частые вопросы</h2>
			{#each article.faq as item}
				<p><strong>{item.question}</strong></p>
				<p>{item.answer}</p>
			{/each}
		</section>
	{/if}

	{#if article.outro?.length}
		<div class="outro-block">
			{#each article.outro as paragraph}
				<p class:intro-highlight={introHighlight(paragraph)}>
					{#each parseInlineLinks(introText(paragraph)) as part}
						{#if part.type === 'link'}
							<a href={part.href}>{part.text}</a>
						{:else}
							{part.value}
						{/if}
					{/each}
				</p>
			{/each}
			<a class="button" href="#article-consultation">Оставить заявку</a>
		</div>
	{/if}

	<section class="author-box">
		<div class="author-mark">СВ</div>
		<div>
			<strong>Виталий Савинский — практикующий юрист</strong>
			<p>
				Специализируюсь на возмещении ущерба от заливов и спорах с застройщиками. Помогаю получить
				реальные деньги, а не обещания.
			</p>
		</div>
	</section>

	<p class="disclaimer">
		Материал носит информационный характер. Правовая оценка зависит от обстоятельств и документов
		конкретной ситуации.
	</p>
</main>

	<section class="final-cta" id="article-consultation">
	<div class="container final-cta-grid">
		<div>
			<div class="eyebrow">Бесплатная консультация</div>
			<!-- CTA must not use H1–H4 — preserves article heading hierarchy for SEO/a11y -->
			<div class="final-cta-title">Оставьте заявку и получите разбор ситуации</div>
			<p>
				Скажу, кто виноват, какие шансы на возмещение и какие документы нужны в первую очередь.
				Отвечу в течение 20 минут в рабочее время.
			</p>
			<div class="direct-links">
				<a href={phoneHref}>{phoneDisplay}</a>
				<a href={telegramHref} target="_blank" rel="noopener noreferrer">Написать в Telegram</a>
			</div>
		</div>

		<form
			onsubmit={submitLead}
			onfocusin={() => {
				if (!formStarted && browser) formStarted = true;
			}}
		>
			<label class="honeypot" aria-hidden="true">
				<span>Компания</span>
				<input name="company" tabindex="-1" autocomplete="off" />
			</label>
			<label>
				<span>Как к вам обращаться</span>
				<input name="name" autocomplete="name" required placeholder="Имя" />
			</label>
			<label>
				<span>Телефон</span>
				<input
					name="phone"
					type="tel"
					inputmode="tel"
					autocomplete="tel"
					required
					placeholder="+7 (___) ___-__-__"
					bind:value={phoneValue}
					oninput={onPhoneInput}
					maxlength="18"
				/>
			</label>
			<label>
				<span>Что произошло</span>
				<textarea
					name="message"
					rows="4"
					placeholder="Например: затопили соседи, акт уже есть"
				></textarea>
			</label>
			<label class="consent">
				<input name="consent" type="checkbox" value="yes" bind:checked={consentAccepted} required />
				<span>
					Согласен с
					<a href="/politika-konfidencialnosti">обработкой персональных данных</a>
				</span>
			</label>
			<button class="button" type="submit" disabled={submitting || !consentAccepted}>
				{submitting ? 'Отправляю…' : 'Оценить перспективы бесплатно'}
			</button>
			{#if formStatus === 'success'}
				<p class="form-message success">{formCopy.success}</p>
			{:else if formStatus === 'invalid'}
				<p class="form-message error">{formCopy.invalidPhone}</p>
			{:else if formStatus === 'error'}
				<p class="form-message error">{formCopy.error}</p>
			{/if}
		</form>
	</div>
</section>

<div class="mobile-bar">
	<a href={phoneHref}>Позвонить</a>
	<a href="#article-consultation">Оценить перспективы</a>
</div>

<style>
	.author-mark {
		display: grid;
		width: 40px;
		height: 40px;
		place-items: center;
		border: 1px solid var(--gold);
		color: var(--gold);
		font-family: var(--serif);
	}

	.meta,
	.disclaimer {
		color: var(--muted);
		font-size: 0.8rem !important;
	}

	.intro-highlight {
		border-left: 4px solid var(--gold);
		background: linear-gradient(90deg, rgba(105, 71, 245, 0.08), transparent 88%);
		padding: 16px 18px;
		font-size: 1.12rem;
		font-weight: 600;
		color: var(--ink);
	}

	.outro-block {
		display: grid;
		gap: 16px;
		margin: 32px 0 8px;
		justify-items: start;
	}

	.outro-block .intro-highlight {
		margin: 0;
		width: 100%;
	}

	.doc-callout {
		display: grid;
		gap: 12px;
		margin: 28px 0;
		border: 1px solid var(--ink);
		border-radius: 22px;
		background: var(--paper-deep);
		box-shadow: 7px 7px 0 var(--ink);
		padding: 22px 24px;
		text-align: center;
	}

	.doc-callout p {
		margin: 0;
		color: var(--ink-soft);
	}

	.doc-callout .button {
		justify-self: center;
	}

	.article-partners {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 20px;
		margin: 28px 0 8px;
	}

	.partner-card {
		display: grid;
		gap: 10px;
		border: 1px solid var(--line);
		border-radius: 18px;
		background: var(--white);
		padding: 18px;
		text-align: center;
	}

	.partner-card img {
		width: 100%;
		max-height: 72px;
		object-fit: contain;
		margin: 0 auto;
	}

	.partner-card:first-child img {
		max-height: 56px;
	}

	.partner-card small {
		color: var(--muted);
	}

	.inline-cta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 28px;
		margin: 48px 0;
		background: var(--ink);
		color: var(--paper);
		padding: 28px;
	}

	.inline-cta p {
		margin: 5px 0 0;
		color: rgba(244, 240, 231, 0.65);
		font-size: 0.85rem;
	}

	.inline-cta .button {
		flex: 0 0 auto;
	}

	.risk-list {
		display: grid;
		gap: 14px;
		margin: 24px 0 0;
		padding: 0;
		list-style: none;
	}

	.risk-list li {
		border: 1px solid var(--line);
		border-left: 4px solid var(--danger);
		background: var(--white);
		padding: 16px 18px;
	}

	.word-doc {
		margin: 28px 0;
		overflow: hidden;
		border: 1px solid #9aa3ad;
		border-radius: 4px;
		background: #edf1f5;
		box-shadow: 0 10px 30px rgba(16, 27, 32, 0.08);
	}

	.word-doc__bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		border-bottom: 1px solid #d5dde5;
		background: linear-gradient(180deg, #ffffff, #e8eef4);
		padding: 10px 14px;
		color: #2f3b45;
		font-size: 0.78rem;
		font-weight: 700;
	}

	.word-doc__bar small {
		color: #66727c;
		font-weight: 500;
	}

	.claim-template {
		margin: 0;
		background: #ffffff;
		color: #111;
		padding: 48px 56px;
		font-family: 'Times New Roman', Times, serif;
		font-size: 14px;
		line-height: 1.55;
		text-align: justify;
		white-space: pre-wrap;
	}

	.author-box {
		display: grid;
		grid-template-columns: 70px 1fr;
		align-items: start;
		margin-top: 70px;
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
		padding: 28px 0;
	}

	.author-mark {
		width: 54px;
		height: 54px;
		background: var(--ink);
	}

	.author-box p {
		margin: 5px 0 0;
		font-size: 0.9rem;
	}

	.final-cta {
		background: var(--gold);
		color: var(--paper);
		padding: 70px 0;
	}

	.final-cta-grid {
		display: grid;
		grid-template-columns: 0.95fr 1.05fr;
		gap: clamp(32px, 6vw, 80px);
		align-items: start;
	}

	.final-cta-title {
		max-width: 700px;
		margin: 0;
		font-family: var(--serif);
		font-size: clamp(2rem, 4vw, 3.5rem);
		font-weight: 400;
		line-height: 1.15;
	}

	.final-cta p {
		max-width: 560px;
		margin: 14px 0 0;
		color: rgba(244, 240, 231, 0.78);
	}

	.final-cta .eyebrow {
		color: var(--paper);
	}

	.direct-links {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
		margin-top: 28px;
	}

	.direct-links a {
		color: var(--gold-light);
		font-weight: 700;
		text-underline-offset: 4px;
	}

	form {
		display: grid;
		gap: 18px;
		border: 1px solid var(--ink);
		border-radius: 30px;
		background: var(--paper);
		box-shadow: 12px 12px 0 var(--ink);
		padding: 30px;
	}

	label > span {
		display: block;
		margin-bottom: 6px;
		color: var(--ink-soft);
		font-size: 0.76rem;
	}

	input,
	textarea {
		width: 100%;
		border: 0;
		border-bottom: 1px solid var(--line);
		border-radius: 0;
		background: transparent;
		color: var(--ink);
		padding: 12px 0;
	}

	input::placeholder,
	textarea::placeholder {
		color: var(--muted);
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

	.honeypot {
		position: absolute;
		left: -10000px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	.form-message {
		margin: 0;
		font-size: 0.8rem;
	}

	.form-message.success {
		color: var(--success);
	}

	.form-message.error {
		color: var(--danger);
	}

	.mobile-bar {
		display: none;
	}

	@media (max-width: 860px) {
		.final-cta-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 680px) {
		.article-partners {
			grid-template-columns: 1fr;
		}

		.inline-cta {
			align-items: stretch;
			flex-direction: column;
		}

		.inline-cta .button {
			width: 100%;
		}

		.claim-template {
			padding: 28px 20px;
			font-size: 13px;
		}

		.word-doc__bar {
			flex-direction: column;
			align-items: flex-start;
		}

		form {
			padding: 22px;
		}

		.consent span {
			font-size: 0.78rem;
		}

		.breadcrumbs {
			line-height: 1.45;
			word-break: break-word;
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
			padding-bottom: env(safe-area-inset-bottom);
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
			background: var(--gold-light);
			color: var(--ink);
		}
	}
</style>
