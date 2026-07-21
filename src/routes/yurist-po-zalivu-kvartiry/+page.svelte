<script lang="ts">
	import { browser } from '$app/environment';
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import { landing } from '$lib/content/landing';
	import JsonLd from '$lib/seo/JsonLd.svelte';
	import {
		breadcrumbListSchema,
		legalServiceSchema,
		organizationSchema,
		personSchema,
		webPageSchema,
		websiteSchema
	} from '$lib/seo/schema';
	import { absoluteUrl } from '$lib/seo/site';

	const phoneDisplay = landing.contacts.phoneDisplay;
	const phoneHref = landing.contacts.phoneHref;
	const telegramHref = landing.contacts.telegramHref;
	const path = '/yurist-po-zalivu-kvartiry';
	const canonical = absoluteUrl(path);

	const schema = {
		'@context': 'https://schema.org',
		'@graph': [
			organizationSchema(),
			personSchema(),
			websiteSchema(),
			legalServiceSchema(),
			webPageSchema({
				path,
				name: 'Юрист по заливу квартиры — взыскание ущерба с виновника',
				description:
					'Юрист по заливу квартиры в Санкт-Петербурге: фиксация, оценка, претензия, суд и взыскание денег с виновника. Бесплатный разбор ситуации.',
				includeAboutService: true
			}),
			breadcrumbListSchema([
				{ name: 'Главная', path: '/' },
				{ name: 'Юрист по заливу квартиры', path }
			])
		]
	};

	let formStarted = $state(false);
	let submitting = $state(false);
	let formStatus = $state<'idle' | 'success' | 'error'>('idle');
	let phoneValue = $state('');
	let consentAccepted = $state(false);

	function digitsOnly(value: string) {
		return value.replace(/\D/g, '');
	}

	function formatRuPhone(value: string) {
		let digits = digitsOnly(value);
		if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
		if (!digits.startsWith('7')) digits = `7${digits}`;
		digits = digits.slice(0, 11);

		const local = digits.slice(1);
		let formatted = '+7';
		if (!local.length) return formatted;

		formatted += ` (${local.slice(0, Math.min(3, local.length))}`;
		if (local.length >= 3) formatted += ')';
		if (local.length > 3) formatted += ` ${local.slice(3, Math.min(6, local.length))}`;
		if (local.length > 6) formatted += `-${local.slice(6, Math.min(8, local.length))}`;
		if (local.length > 8) formatted += `-${local.slice(8, Math.min(10, local.length))}`;
		return formatted;
	}

	function onPhoneInput(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		phoneValue = formatRuPhone(input.value);
		input.value = phoneValue;
	}

	async function submitLead(event: SubmitEvent) {
		event.preventDefault();
		if (!consentAccepted) return;
		submitting = true;
		formStatus = 'idle';
		const form = event.currentTarget as HTMLFormElement;

		if (digitsOnly(phoneValue).length !== 11) {
			formStatus = 'error';
			submitting = false;
			return;
		}

		try {
			const response = await fetch('/api/lead', {
				method: 'POST',
				body: new FormData(form)
			});
			if (!response.ok) throw new Error('Lead request failed');
			formStatus = 'success';
			form.reset();
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
	<title>Юрист по заливу квартиры — взыскание ущерба с виновника | Савинский Виталий</title>
	<meta
		name="description"
		content="Юрист по заливу квартиры в Санкт-Петербурге и Ленинградской области. Фиксация, оценка, претензия, суд и взыскание денег. Бесплатный разбор ситуации."
	/>
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonical} />
	<meta
		property="og:title"
		content="Юрист по заливу квартиры — взыскание ущерба с виновника"
	/>
	<meta
		property="og:description"
		content="Возьму на себя фиксацию, экспертизу, претензию и суд. Основная часть оплаты — после получения вами денег."
	/>
	<meta property="og:image" content={absoluteUrl('/images/savinskiy.png')} />
</svelte:head>

<JsonLd data={schema} />

<SiteHeader />

<main>
	<section class="hero">
		<div class="container hero-grid">
			<div>
				<nav class="breadcrumbs" aria-label="Хлебные крошки">
					<a href="/">Главная</a> → Юрист по заливу квартиры
				</nav>
				<h1>Юрист по заливу квартиры — взыскание ущерба с виновника</h1>
				<p class="lead">
					Вас залили соседи сверху? Или прорвало трубу по вине управляющей компании? Это всегда
					неприятно, а часто и очень дорого. Мебель испорчена, ремонт безнадёжно повреждён, а
					виновник только кормит обещаниями или вообще делает вид, что ничего не произошло.
				</p>
				<p>
					Вы пытаетесь договориться, звоните в УК, но время идёт, а ущерб только растёт.
					Самостоятельно добиться справедливости очень сложно. Без юридической поддержки люди часто
					взыскивают в 2–3 раза меньше реальной стоимости ущерба.
				</p>
				<p class="accent">
					Я знаю, как добиться полного возмещения ущерба, и готов взять на себя все хлопоты.
				</p>
				<div class="hero-actions">
					<a class="button" href="#consultation">Заказать звонок</a>
					<a class="button button--outline" href="#consultation">Оставить заявку</a>
				</div>
			</div>
		</div>
	</section>

	<section class="section" id="process">
		<div class="container narrow">
			<h2>Как я работаю</h2>

			<article class="step">
				<h3>Шаг 1: Фиксация</h3>
				<p>
					Как только произошёл залив, сразу же напишите или звоните мне. Я сразу вышлю чёткую
					инструкцию, что делать и как зафиксировать все повреждения, и проконтролирую, чтобы акт о
					заливе был составлен максимально полно и грамотно. Это ваш главный документ в суде.
				</p>
				<p>
					Подробный алгоритм для пострадавшего —
					<a href="/stati/zalili-kvartiru-chto-delat-postradavshemu">в инструкции</a>
					и в материале про
					<a href="/stati/zalili-kvartiru-chto-delat-postradavshemu-pervye-shagi">первые шаги</a>.
				</p>
			</article>

			<article class="step">
				<h3>Шаг 2: Оценка ущерба</h3>
				<p>
					Чтобы получить справедливую сумму, нужно точно знать, сколько стоит ремонт. Я привлеку
					эксперта, который определит реальную рыночную стоимость восстановления вашего имущества.
					Никаких заниженных или завышенных сумм, которые прогорают в суде — только объективная
					оценка.
				</p>
			</article>

			<article class="step">
				<h3>Шаг 3: Досудебная претензия</h3>
				<p>
					Прежде чем идти в суд, мы попробуем решить вопрос миром. Я подготовлю и направлю виновнику
					юридически грамотную досудебную претензию. Иногда уже на этом этапе удаётся договориться о
					компенсации, избегая судебных тяжб. Я сам веду все переговоры.
				</p>
			</article>

			<article class="step">
				<h3>Шаг 4: Суд и взыскание</h3>
				<p>
					Если договориться не удалось, мы идём в суд. Я подам исковое заявление, буду представлять
					ваши интересы на каждом заседании и сделаю всё, чтобы суд принял решение в вашу пользу.
					После получения исполнительного листа я проконтролирую, чтобы вы реально получили деньги.
				</p>
			</article>
		</div>
	</section>

	<section class="section section--tint">
		<div class="container narrow">
			<h2>Реальные кейсы из практики</h2>
			<ul class="cases">
				<li>Договорился с УК о досудебной выплате — <strong>391 141 ₽</strong></li>
				<li>
					Дважды заключил мировое соглашение в суде по протечке на сумму
					<strong>более 700 000 ₽</strong>
				</li>
				<li>Взыскал с УК по решению суда <strong>более 700 000 ₽</strong></li>
			</ul>
		</div>
	</section>

	<section class="section">
		<div class="container narrow">
			<h2>Опыт в цифрах</h2>
			<ul class="stats">
				<li>Более 8 лет практики в судах Санкт-Петербурга и Ленинградской области</li>
				<li>Более 600 судебных заседаний</li>
				<li>Более 30 млн рублей взыскано в пользу доверителей</li>
				<li>Более 40 положительных отзывов довольных клиентов</li>
			</ul>
		</div>
	</section>

	<section class="section section--tint">
		<div class="container narrow">
			<h2>Если вы залили соседей — что делать виновнику</h2>
			<p>
				Такое случается. Прорвало шланг стиральной машины, забыли закрыть кран, протекла труба — и вы
				стали виновником залива. Главное сейчас — не паниковать и действовать правильно.
			</p>
			<p>
				<strong>Первое:</strong> немедленно остановите подачу воды и вызовите аварийную службу. Чем
				быстрее вы минимизируете ущерб, тем меньше сумма претензий. Обязательно примите меры к
				осушению всех поверхностей.
			</p>
			<p>
				<strong>Второе:</strong> обязательно присутствуйте при составлении акта о заливе. Внимательно
				читайте каждую строчку. Если вы не согласны с причиной или объёмом повреждений — сделайте
				письменную отметку «с актом не согласен, так как...» и укажите причину.
			</p>
			<p>
				<strong>Третье:</strong> присутствуйте на оценке ущерба, которую заказывает потерпевший.
				Фиксируйте всё на фото и видео. Если в отчёт включают старые дефекты или завышают цены — вы
				сможете это оспорить.
			</p>
			<p>
				<strong>Четвёртое:</strong> не спешите платить любую сумму. Я помогу добиться снижения суммы
				взыскания. Если вы докажете, что потерпевший сам способствовал увеличению ущерба (не вызвал
				аварийку, не просушил помещение), суд может уменьшить размер возмещения. Работаю с обеими
				сторонами — и помогаю виновникам залива уменьшить сумму выплат.
			</p>
		</div>
	</section>

	<section class="section">
		<div class="container narrow">
			<h2>Порядок составления акта о заливе</h2>
			<p>
				Акт о заливе — ваш главный документ. Без него невозможно доказать сам факт затопления и его
				причины. Вот что важно знать:
			</p>
			<ul>
				<li>Акт составляет управляющая компания или ТСЖ в течение 12 часов с момента обращения</li>
				<li>
					В акте должны быть указаны: дата и время залива, адрес, предполагаемая причина, полный
					перечень повреждений, подписи членов комиссии
				</li>
				<li>Если вы не согласны с содержанием — требуйте внести ваши замечания до подписания</li>
				<li>
					Если УК отказывается составлять акт или затягивает сроки — фиксируйте это письменно,
					звоните на горячую линию, жалуйтесь в жилищную инспекцию
				</li>
				<li>Получите копию акта сразу же — это ваш экземпляр для суда</li>
			</ul>
			<p>
				Я помогу быстро проверить акт, если это требуется. Это значит, что документ будет составлен
				правильно с первого раза — и виновнику будет нечего оспаривать.
			</p>
			<p>
				Кто отвечает — сосед или УК —
				<a href="/stati/kto-otvechaet-sosed-ili-uk">разбираю в отдельной статье</a>.
			</p>
		</div>
	</section>

	<section class="section section--tint">
		<div class="container narrow">
			<h2>Для чего нужна оценка ущерба</h2>
			<p>
				Акт фиксирует факт залива. Оценка ущерба — считает, сколько денег нужно на восстановление.
			</p>
			<p>
				Независимая экспертиза определяет рыночную стоимость ремонта: материалов, работ, испорченной
				мебели и техники. Именно эта цифра ляжет в основу исковых требований.
			</p>
			<p>Без экспертизы вы рискуете:</p>
			<ul>
				<li>
					получить от виновника только часть суммы («ну, там потолок подкрасить — 5 тысяч хватит»);
				</li>
				<li>
					пропустить скрытые повреждения или мебель и технику (грибок, разбухшие стены), которые
					проявятся через месяц.
				</li>
			</ul>
			<p>
				Я работаю с аккредитованными экспертами. Организую экспертизу за 1–2 дня после залива — пока
				повреждения свежие и их невозможно оспорить.
			</p>
		</div>
	</section>

	<section class="section why-section">
		<div class="container why-grid">
			<figure class="why-photo">
				<img
					src="/images/savinskiy-court.jpg"
					alt="Савинский Виталий в Санкт-Петербургском городском суде"
					width="1024"
					height="883"
				/>
			</figure>
			<div>
				<h2>Почему я, а не Авито / Профи.ру</h2>
				<ul class="why">
					<li>
						<strong>Судебная практика с 2017 года.</strong> Веду дела в судах Санкт-Петербурга и
						Ленинградской области — знаю, как работают процессы на месте, а не «по шаблону из
						интернета».
					</li>
					<li>
						<strong>Более 600 судебных заседаний</strong> по спорам с недвижимостью. Это не разовые
						консультации с Авито, а регулярная работа в зале суда.
					</li>
					<li>
						<strong>Два высших образования</strong> в юриспруденции — в области права и технологий.
						Помогаю разобраться и в правовых, и в технических нюансах залива.
					</li>
					<li>
						<strong>Работаю с оплатой по результату.</strong> Основная часть вознаграждения — после
						того, как вы получили деньги. Цель — максимальная компенсация, а не «поучаствовать».
					</li>
					<li>
						<strong>Персональное ведение дела.</strong> Лично веду вашу ситуацию от фиксации до
						взыскания. Специализация — заливы квартир и споры с недвижимостью, а не «юрист на все
						случаи».
					</li>
					<li>
						<strong>Всегда на связи.</strong> Можно написать или позвонить практически в любое время
						и получить оперативный ответ по делу.
					</li>
				</ul>
			</div>
		</div>
	</section>

	<section class="consultation" id="consultation">
		<div class="container consultation-grid">
			<div>
				<div class="eyebrow">Бесплатная оценка</div>
				<div class="consultation-title">Опишите ситуацию — я свяжусь в течение часа</div>
				<p>
					Не откладывайте решение проблемы с заливом. Чем быстрее мы начнём действовать, тем выше
					шансы на полный успех.
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
						value={phoneValue}
						oninput={onPhoneInput}
						minlength="18"
						maxlength="18"
					/>
				</label>
				<label>
					<span>Что произошло</span>
					<textarea
						name="message"
						rows="4"
						placeholder="Например: затопили соседи сверху, акт уже есть"
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
					{submitting ? 'Отправляю…' : 'Заказать звонок'}
				</button>
				{#if formStatus === 'success'}
					<p class="form-message success">Заявка принята. Я свяжусь с вами в ближайшее время.</p>
				{:else if formStatus === 'error'}
					<p class="form-message error">
						Проверьте номер телефона в формате +7 (999) 999-99-99 или напишите в Telegram.
					</p>
				{/if}
			</form>
		</div>
	</section>
</main>

<footer>
	<div class="container footer-note">
		<p>
			Информация на странице не является гарантией результата. Перспективы зависят от обстоятельств и
			доказательств конкретного дела.
		</p>
		<p><a href="/">На главную</a> · <a href="/stati">Статьи</a></p>
	</div>
</footer>

<div class="mobile-bar">
	<a href={phoneHref}>Позвонить</a>
	<a href="#consultation">Заказать звонок</a>
</div>

<style>
	.hero {
		background: linear-gradient(155deg, var(--paper) 0 72%, #e6ddff 72%);
		padding: clamp(40px, 6vw, 80px) 0;
	}

	.hero-grid {
		max-width: 860px;
	}

	.breadcrumbs {
		margin-bottom: 24px;
		color: var(--muted);
		font-size: 0.86rem;
	}

	.breadcrumbs a {
		text-underline-offset: 3px;
	}

	h1 {
		margin: 0 0 24px;
		font-size: clamp(2.2rem, 5.5vw, 4rem);
	}

	.lead,
	.accent {
		font-size: 1.08rem;
	}

	.accent {
		font-weight: 700;
		color: var(--ink);
	}

	.hero-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 32px;
	}

	.narrow {
		max-width: 820px;
	}

	.section--tint {
		background: var(--paper-deep);
	}

	.step {
		margin-top: 28px;
		padding-top: 28px;
		border-top: 1px solid var(--line);
	}

	.step:first-of-type {
		border-top: 0;
		padding-top: 0;
	}

	.cases,
	.stats,
	.why {
		display: grid;
		gap: 14px;
		margin: 24px 0 0;
		padding: 0;
		list-style: none;
	}

	.why-grid {
		display: grid;
		grid-template-columns: minmax(260px, 0.85fr) 1.15fr;
		gap: clamp(28px, 5vw, 64px);
		align-items: start;
	}

	.why-photo {
		margin: 0;
		overflow: hidden;
		border: 1px solid var(--ink);
		border-radius: 28px;
		background: #ddd6cb;
		box-shadow: 14px 14px 0 var(--ink);
		transform: rotate(-1.5deg);
	}

	.why-photo img {
		width: 100%;
		height: 100%;
		min-height: 420px;
		object-fit: cover;
		object-position: center top;
	}

	.why-section h2 {
		margin-top: 0;
	}

	.cases li,
	.stats li,
	.why li {
		border: 1px solid var(--ink);
		border-radius: 18px;
		background: var(--white);
		box-shadow: 5px 5px 0 var(--ink);
		padding: 16px 18px;
	}

	.consultation {
		background: var(--gold);
		color: var(--paper);
		padding: clamp(60px, 9vw, 110px) 0;
	}

	.consultation-grid {
		display: grid;
		grid-template-columns: 0.95fr 1.05fr;
		gap: clamp(28px, 5vw, 70px);
		align-items: start;
	}

	.consultation-title {
		font-family: var(--serif);
		font-size: clamp(2rem, 4vw, 3.4rem);
		font-weight: 700;
		letter-spacing: -0.04em;
		line-height: 1.05;
	}

	.consultation p {
		color: rgba(244, 240, 231, 0.82);
	}

	.consultation .eyebrow {
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

	footer {
		background: var(--ink);
		color: var(--paper);
		padding: 36px 0;
	}

	.footer-note p {
		color: rgba(244, 240, 231, 0.55);
		font-size: 0.78rem;
	}

	.footer-note a {
		color: var(--gold-light);
	}

	.mobile-bar {
		display: none;
	}

	@media (max-width: 860px) {
		.consultation-grid,
		.why-grid {
			grid-template-columns: 1fr;
		}

		.why-photo {
			max-width: 420px;
			transform: none;
		}

		.why-photo img {
			min-height: 300px;
		}

		.hero-actions {
			display: grid;
		}

		.hero-actions .button {
			width: 100%;
		}

		.hero h1 {
			font-size: clamp(2.1rem, 9vw, 3rem);
		}
	}

	@media (max-width: 720px) {
		.consent span {
			font-size: 0.78rem;
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

	@media (max-width: 600px) {
		form {
			padding: 22px;
		}

		.cases li,
		.stats li,
		.why li {
			padding: 14px 16px;
			border-radius: 16px;
		}
	}
</style>
