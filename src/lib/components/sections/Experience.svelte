<script lang="ts">
	import { experience } from '$lib/data/content';
	import { inview } from '$lib/actions/inview';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import ConveyorBelt from '$lib/components/ui/ConveyorBelt.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import { simulator } from '$lib/stores/simulator.svelte';

	let conveyorEl = $state<HTMLElement>();
	let conveyorVisible = $state(false);

	// Photo slider — native scroll-snap handles swipe; arrows and keys scroll by one slide.
	let slider = $state<HTMLElement>();
	let slideIndex = $state(0);

	function goToSlide(i: number) {
		if (!slider) return;
		const n = bartendingPhotos.length;
		const target = (i + n) % n;
		const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		slider.scrollTo({ left: target * slider.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
	}

	function onSliderScroll() {
		if (!slider) return;
		slideIndex = Math.round(slider.scrollLeft / slider.clientWidth);
	}

	// Arrow keys on the focused slide; focus follows so it never lands on a hidden slide.
	function onSlideKey(e: KeyboardEvent) {
		if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
		e.preventDefault();
		const n = bartendingPhotos.length;
		const next = (slideIndex + (e.key === 'ArrowRight' ? 1 : -1) + n) % n;
		goToSlide(next);
		slideIndex = next;
		slider?.querySelectorAll<HTMLElement>('.slide')[next]?.focus({ preventScroll: true });
	}

	const bartendingPhotos = [
		{ src: '/images/Bartending/pouring.jpeg', alt: 'Ryan pouring a cocktail' },
		{
			src: '/images/Bartending/nickandnora_cocktail.jpeg',
			alt: 'Cocktail in a nick and nora glass'
		},
		{ src: '/images/Bartending/ryan_holdingdrink.jpeg', alt: 'Ryan holding a finished cocktail' },
		{
			src: '/images/Bartending/mercyandryan1.jpeg',
			alt: 'Ryan and coworker Mercy with a cocktail'
		},
		{ src: '/images/Bartending/mercyandryan2.jpeg', alt: 'Ryan and Mercy behind the bar' },
		{ src: '/images/Bartending/justinandryan1.jpeg', alt: 'Ryan and coworker Justin' },
		{ src: '/images/Bartending/justinandryan2.jpeg', alt: 'Ryan and Justin behind the bar' },
		{ src: '/images/Bartending/hollyandryan.jpeg', alt: 'Ryan and coworker Holly' },
		{ src: '/images/Bartending/audreyandhannahandryan.jpeg', alt: 'Ryan with Audrey and Hannah' },
		{ src: '/images/Bartending/maxandryan.jpeg', alt: 'Ryan and Max' }
	];

	let lightboxSrc = $state('');
	let lightboxAlt = $state('');
	let lightboxOpen = $state(false);

	function openLightbox(src: string, alt: string) {
		lightboxSrc = src;
		lightboxAlt = alt;
		lightboxOpen = true;
	}

	function closeLightbox() {
		lightboxOpen = false;
	}

	$effect(() => {
		const el = conveyorEl;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					conveyorVisible = true;
					observer.disconnect();
				}
			},
			{ threshold: 0.3 }
		);
		observer.observe(el);

		return () => observer.disconnect();
	});
</script>

<SectionWrapper id="experience" headingId="experience-heading" number="02" title="Experience" alt>
	<!--
		Cards, not rules. This section sits on the alt ground, so a raised surface is
		what gives each role an edge against the tint behind it — and with seven entries
		the boundaries are what make the column scannable.
	-->
	<ul class="stagger space-y-5" use:inview>
		{#each experience as job, jobIndex (job.company + job.title)}
			<Card as="li" interactive class="group p-6 md:p-7" style="--i: {jobIndex}">
				<div
					class="flex flex-col items-center gap-1 text-center sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:text-left"
				>
					<div>
						<h3 class="text-ink-strong font-display text-2xl font-semibold">
							{job.title}
						</h3>
						<p class="text-brand mt-1 text-base font-medium">
							{job.company}
						</p>
					</div>
					<div class="shrink-0 sm:text-right">
						<Badge tone="warm" size="sm">{job.period}</Badge>
						<p class="text-ink-muted mt-1.5 text-sm">
							{job.location}
						</p>
					</div>
				</div>
				{#if job.bullets.length > 0}
					<ul class="mt-5 space-y-2.5">
						{#each job.bullets as bullet (bullet)}
							<li class="text-ink-muted text-body flex gap-2.5">
								<span
									class="bg-ember-500 mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full"
									aria-hidden="true"
								></span>
								<span>{bullet}</span>
							</li>
						{/each}
					</ul>
				{/if}
				{#if job.tags && job.tags.length > 0}
					<div class="mt-5 flex flex-wrap gap-1.5">
						{#each job.tags as tag (tag)}
							<Badge tone="plum">{tag}</Badge>
						{/each}
					</div>
				{/if}
				{#if job.href}
					<div class="mt-5">
						<ArrowLink href={job.href} label={job.hrefLabel ?? 'Read more'} size="sm" />
					</div>
				{/if}
				{#if job.showSimulator}
					<div class="mt-6 flex justify-center">
						<button
							type="button"
							class="border-accent-400 bg-accent-50 text-accent-800 hover:bg-accent-100 hover:border-accent-500 focus:ring-accent-500 dark:border-accent-700 dark:bg-accent-950 dark:text-accent-200 dark:hover:bg-accent-900 dark:focus:ring-offset-warm-900 ease-spring inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-[background-color,border-color,transform] duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
							onclick={() => simulator.launch()}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fill-rule="evenodd"
									d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h6v4H7V5zm2 6h2v2H9v-2z"
									clip-rule="evenodd"
								/>
							</svg>
							Try the WMS Simulator
						</button>
					</div>
					<!--
						Bled to the card edges rather than boxed again inside it — a border
						within a border reads as clutter.
					-->
					<div
						class="mt-6 mr-[-1.5rem] -mb-6 -ml-6 overflow-hidden rounded-b-xl md:mr-[-1.75rem] md:-mb-7 md:-ml-7"
						bind:this={conveyorEl}
					>
						<ConveyorBelt visible={conveyorVisible} />
					</div>
				{/if}
				{#if job.showBartendingPhotos}
					<div
						class="bg-warm-100 dark:bg-warm-800 relative mt-6 mr-[-1.5rem] -mb-6 -ml-6 overflow-hidden rounded-b-xl md:mr-[-1.75rem] md:-mb-7 md:-ml-7"
						role="region"
						aria-roledescription="carousel"
						aria-label="Bartending photos"
					>
						<div
							class="photo-slider h-80 sm:h-[26rem]"
							bind:this={slider}
							onscroll={onSliderScroll}
						>
							{#each bartendingPhotos as photo, i (photo.src)}
								<button
									type="button"
									onclick={() => openLightbox(photo.src, photo.alt)}
									class="slide focus-visible:ring-accent-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset"
									tabindex={i === slideIndex ? 0 : -1}
									aria-hidden={i !== slideIndex}
									aria-label="Enlarge: {photo.alt}"
									onkeydown={onSlideKey}
								>
									<!-- Blurred copy fills the frame so portrait and landscape shots sit on the same stage. -->
									<img src={photo.src} alt="" class="slide-backdrop" loading="lazy" />
									<img
										src={photo.src}
										alt={photo.alt}
										class="relative h-full w-full object-contain"
										loading={i === 0 ? 'eager' : 'lazy'}
										draggable="false"
									/>
								</button>
							{/each}
						</div>
						<button
							type="button"
							onclick={() => goToSlide(slideIndex - 1)}
							class="slider-arrow left-3"
							aria-label="Previous photo"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<polyline points="15 18 9 12 15 6" />
							</svg>
						</button>
						<button
							type="button"
							onclick={() => goToSlide(slideIndex + 1)}
							class="slider-arrow right-3"
							aria-label="Next photo"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<polyline points="9 18 15 12 9 6" />
							</svg>
						</button>
						<p class="sr-only" aria-live="polite">
							Photo {slideIndex + 1} of {bartendingPhotos.length}
						</p>
						<div
							class="absolute inset-x-0 bottom-3 flex justify-center gap-1.5"
							role="group"
							aria-label="Choose photo"
						>
							{#each bartendingPhotos as photo, i (photo.src)}
								<button
									type="button"
									onclick={() => goToSlide(i)}
									class="slider-dot"
									class:active={i === slideIndex}
									aria-label="Show photo {i + 1}"
									aria-current={i === slideIndex}
								></button>
							{/each}
						</div>
					</div>
				{/if}
			</Card>
		{/each}
	</ul>
</SectionWrapper>

{#if lightboxOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
		onclick={closeLightbox}
		onkeydown={(e) => {
			if (e.key === 'Escape') closeLightbox();
		}}
		role="dialog"
		aria-label="Photo preview"
		tabindex="-1"
	>
		<button
			type="button"
			onclick={closeLightbox}
			class="bg-warm-800/60 hover:bg-warm-700 absolute top-4 right-4 rounded-full p-2 text-white transition-colors"
			aria-label="Close photo"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"
			>
				<line x1="18" y1="6" x2="6" y2="18" />
				<line x1="6" y1="6" x2="18" y2="18" />
			</svg>
		</button>
		<!-- eslint-disable-next-line -- stop click from closing lightbox -->
		<div onclick={(e) => e.stopPropagation()} role="presentation">
			<img
				src={lightboxSrc}
				alt={lightboxAlt}
				class="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
			/>
		</div>
	</div>
{/if}

<style>
	.photo-slider {
		display: flex;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		overscroll-behavior-x: contain;
		scrollbar-width: none;
	}

	.photo-slider::-webkit-scrollbar {
		display: none;
	}

	.slide {
		position: relative;
		flex: 0 0 100%;
		height: 100%;
		overflow: hidden;
		scroll-snap-align: center;
		scroll-snap-stop: always;
		cursor: zoom-in;
	}

	.slide-backdrop {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: blur(24px) saturate(1.1);
		transform: scale(1.15);
		opacity: 0.55;
	}

	.slider-arrow {
		position: absolute;
		top: 50%;
		translate: 0 -50%;
		display: grid;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 9999px;
		color: white;
		background: rgb(0 0 0 / 0.45);
		backdrop-filter: blur(4px);
		transition:
			background-color 150ms,
			scale 150ms;
	}

	.slider-arrow:hover {
		background: rgb(0 0 0 / 0.65);
	}

	.slider-arrow:active {
		scale: 0.94;
	}

	.slider-arrow:focus-visible {
		outline: 2px solid var(--color-accent-400);
		outline-offset: 2px;
	}

	/* Padding + content-box clip keeps the dot small but the tap target near 20px. */
	.slider-dot {
		width: 1.25rem;
		height: 1.25rem;
		padding: 0.375rem;
		background-clip: content-box;
		border-radius: 9999px;
		background-color: rgb(255 255 255 / 0.55);
		transition:
			width 200ms,
			background-color 200ms;
	}

	.slider-dot.active {
		width: 2rem;
		background-color: white;
	}

	.slider-dot:focus-visible {
		outline: 2px solid var(--color-accent-400);
		outline-offset: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.slider-arrow,
		.slider-dot {
			transition: none;
		}
	}
</style>
