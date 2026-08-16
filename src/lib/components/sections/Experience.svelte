<script lang="ts">
	import { experience } from '$lib/data/content';
	import { inview } from '$lib/actions/inview';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
	import ConveyorBelt from '$lib/components/ui/ConveyorBelt.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import ArrowLink from '$lib/components/ui/ArrowLink.svelte';
	import { simulator } from '$lib/stores/simulator.svelte';

	let conveyorEl = $state<HTMLElement>();
	let conveyorVisible = $state(false);

	// Marquee state — JS-driven for touch support
	let marqueeTrack = $state<HTMLElement>();
	let marqueeOffset = $state(0);
	let marqueeVisible = $state(false);
	let autoSpeed = 1.2; // pixels per frame
	let currentSpeed = $state(autoSpeed);
	let touchStartX = 0;
	let touchStartOffset = 0;
	let isTouching = $state(false);
	let lastTouchX = 0;
	let lastTouchTime = 0;
	let touchVelocity = 0;
	let rafId: number;

	function getHalfWidth(): number {
		if (!marqueeTrack) return 1;
		return marqueeTrack.scrollWidth / 2;
	}

	function tickMarquee() {
		if (!marqueeVisible) {
			rafId = requestAnimationFrame(tickMarquee);
			return;
		}

		if (!isTouching) {
			// Decay touch velocity back to auto speed
			if (Math.abs(currentSpeed - autoSpeed) > 0.05) {
				currentSpeed += (autoSpeed - currentSpeed) * 0.03;
			} else {
				currentSpeed = autoSpeed;
			}
			marqueeOffset -= currentSpeed;
		}

		// Wrap seamlessly
		const half = getHalfWidth();
		if (half > 0) {
			if (marqueeOffset <= -half) marqueeOffset += half;
			if (marqueeOffset > 0) marqueeOffset -= half;
		}

		if (marqueeTrack) {
			marqueeTrack.style.transform = `translateX(${marqueeOffset}px)`;
		}

		rafId = requestAnimationFrame(tickMarquee);
	}

	function onTouchStart(e: TouchEvent) {
		isTouching = true;
		touchStartX = e.touches[0].clientX;
		touchStartOffset = marqueeOffset;
		lastTouchX = touchStartX;
		lastTouchTime = performance.now();
		touchVelocity = 0;
	}

	function onTouchMove(e: TouchEvent) {
		if (!isTouching) return;
		const x = e.touches[0].clientX;
		const now = performance.now();
		const dt = now - lastTouchTime;
		if (dt > 0) {
			touchVelocity = ((x - lastTouchX) / dt) * 16; // normalize to ~per-frame
		}
		lastTouchX = x;
		lastTouchTime = now;
		marqueeOffset = touchStartOffset + (x - touchStartX);
	}

	function onTouchEnd() {
		isTouching = false;
		// Apply swipe velocity — negative because offset moves left for right-scroll
		currentSpeed = -touchVelocity || autoSpeed;
	}

	$effect(() => {
		rafId = requestAnimationFrame(tickMarquee);
		return () => cancelAnimationFrame(rafId);
	});

	// Observe marquee visibility
	let marqueeContainer = $state<HTMLElement>();
	$effect(() => {
		const el = marqueeContainer;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				marqueeVisible = entry.isIntersecting;
			},
			{ threshold: 0.1 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	});

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
	<div class="stagger-children space-y-4" use:inview>
		{#each experience as job (job.company + job.title)}
			<Card interactive class="group p-6">
				<div class="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
					<div>
						<h3 class="text-primary-700 dark:text-primary-200 text-lg font-bold">
							{job.title}
						</h3>
						<p class="text-accent-600 dark:text-accent-300 text-sm font-medium">
							{job.company}
						</p>
					</div>
					<div class="shrink-0 text-right">
						<Badge tone="warm" size="sm">{job.period}</Badge>
						<p class="text-warm-600 dark:text-warm-400 mt-1 text-sm">
							{job.location}
						</p>
					</div>
				</div>
				{#if job.bullets.length > 0}
					<ul class="mt-4 space-y-2">
						{#each job.bullets as bullet (bullet)}
							<li class="text-warm-600 dark:text-warm-400 flex gap-2 text-sm leading-relaxed">
								<span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" aria-hidden="true"
								></span>
								<span>{bullet}</span>
							</li>
						{/each}
					</ul>
				{/if}
				{#if job.tags && job.tags.length > 0}
					<div class="mt-4 flex flex-wrap gap-1.5">
						{#each job.tags as tag (tag)}
							<Badge>{tag}</Badge>
						{/each}
					</div>
				{/if}
				{#if job.href}
					<div class="mt-4">
						<ArrowLink href={job.href} label={job.hrefLabel ?? 'Read more'} size="sm" />
					</div>
				{/if}
				{#if job.showSimulator}
					<div class="mt-4 flex justify-center">
						<button
							type="button"
							class="border-accent-300 bg-accent-50 text-accent-700 hover:bg-accent-100 hover:border-accent-400 focus:ring-accent-400 dark:border-accent-500 dark:bg-accent-900 dark:text-accent-100 dark:hover:bg-accent-800 dark:focus:ring-accent-500 dark:focus:ring-offset-warm-800 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
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
					<div class="-mx-6 mt-4 -mb-6" bind:this={conveyorEl}>
						<ConveyorBelt visible={conveyorVisible} />
					</div>
				{/if}
			</Card>
			{#if job.showBartendingPhotos}
				<div
					class="photo-marquee min-h-[12rem] overflow-hidden rounded-xl sm:min-h-[14rem]"
					bind:this={marqueeContainer}
					role="region"
					aria-label="Bartending photo carousel"
					ontouchstart={onTouchStart}
					ontouchmove={onTouchMove}
					ontouchend={onTouchEnd}
				>
					<div class="marquee-track" bind:this={marqueeTrack}>
						{#each bartendingPhotos as photo (photo.src)}
							<button
								type="button"
								onclick={() => openLightbox(photo.src, photo.alt)}
								class="focus:ring-accent-400 h-48 flex-shrink-0 cursor-pointer rounded-lg focus:ring-2 focus:outline-none sm:h-56"
							>
								<img
									src={photo.src}
									alt={photo.alt}
									class="h-full w-auto rounded-lg object-cover transition-transform hover:scale-105"
								/>
							</button>
						{/each}
						{#each bartendingPhotos as photo (photo.src)}
							<button
								type="button"
								onclick={() => openLightbox(photo.src, photo.alt)}
								class="focus:ring-accent-400 h-48 flex-shrink-0 cursor-pointer rounded-lg focus:ring-2 focus:outline-none sm:h-56"
								tabindex="-1"
								aria-hidden="true"
							>
								<img
									src={photo.src}
									alt=""
									class="h-full w-auto rounded-lg object-cover transition-transform hover:scale-105"
								/>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	</div>
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
	.marquee-track {
		display: flex;
		gap: 0.75rem;
		width: max-content;
		will-change: transform;
	}

	.photo-marquee {
		touch-action: pan-y;
	}
</style>
