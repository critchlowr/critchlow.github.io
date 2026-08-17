<script lang="ts">
	import { experience } from '$lib/data/content';
	import { inview } from '$lib/actions/inview';
	import { dialog } from '$lib/actions/dialog';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import ConveyorBelt from '$lib/components/ui/ConveyorBelt.svelte';
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

	/*
		Three reasons the belt can be stopped, kept separate because they are not the
		same thing and must not clobber one another:

		- `paused` is the user's explicit choice via the button. WCAG 2.2.2 Pause,
		  Stop, Hide applies here — this scrolls automatically, runs well past five
		  seconds, and sits alongside other content, so a control to stop it is a
		  Level A requirement, not a nicety.
		- `reduceMotion` is the OS preference. Read live rather than once, so a
		  mid-session change is honoured.
		- `focusWithin` stops the belt while a photo button has keyboard focus.
		  Without it the focused element translates out of the clipped container
		  while still focused, which is SC 2.4.11.
	*/
	let paused = $state(false);
	let focusWithin = $state(false);
	let reduceMotion = $state(false);

	$effect(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		reduceMotion = mq.matches;
		const onChange = () => (reduceMotion = mq.matches);
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});

	const marqueeRunning = $derived(!paused && !reduceMotion && !focusWithin);

	function getHalfWidth(): number {
		if (!marqueeTrack) return 1;
		return marqueeTrack.scrollWidth / 2;
	}

	function tickMarquee() {
		// Still scheduled while stopped, so a drag can move the belt and the wrap
		// logic below keeps running — stopping the animation must not freeze the
		// component, only the automatic movement.
		if (!marqueeVisible || !marqueeRunning) {
			rafId = requestAnimationFrame(tickMarquee);
			if (marqueeTrack && isTouching) {
				marqueeTrack.style.transform = `translateX(${marqueeOffset}px)`;
			}
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
							class="border-accent-400 bg-accent-50 text-accent-800 hover:bg-accent-100 hover:border-accent-500 dark:border-accent-700 dark:bg-accent-950 dark:text-accent-200 dark:hover:bg-accent-900 ease-spring inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-[background-color,border-color,transform] duration-200 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
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
					<!--
						min-h is a rem taller than the h-48/sm:h-56 buttons inside it. They used
						to be exactly equal, so with the container clipped the focus ring on a
						photo was cut off top and bottom.
					-->
					<div
						class="photo-marquee relative mt-6 mr-[-1.5rem] -mb-6 -ml-6 min-h-[13rem] overflow-hidden rounded-b-xl sm:min-h-[15rem] md:mr-[-1.75rem] md:-mb-7 md:-ml-7"
						bind:this={marqueeContainer}
						role="region"
						aria-label="Bartending photo carousel"
						ontouchstart={onTouchStart}
						ontouchmove={onTouchMove}
						ontouchend={onTouchEnd}
						onfocusin={() => (focusWithin = true)}
						onfocusout={() => (focusWithin = false)}
					>
						<!--
							WCAG 2.2.2 Pause, Stop, Hide. Last in the DOM but positioned top-right,
							so it does not land between the photos and whatever precedes them in the
							tab order. Hidden entirely when the OS asks for reduced motion, because
							then there is no movement to pause.
						-->
						{#if !reduceMotion}
							<button
								type="button"
								onclick={() => (paused = !paused)}
								aria-pressed={paused}
								class="bg-warm-900/70 hover:bg-warm-900/90 absolute top-2 right-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors"
							>
								<span class="sr-only"
									>{paused ? 'Play' : 'Pause'} the bartending photo carousel</span
								>
								{#if paused}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5"
										viewBox="0 0 24 24"
										fill="currentColor"
										aria-hidden="true"
									>
										<path d="M8 5v14l11-7z" />
									</svg>
								{:else}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-5 w-5"
										viewBox="0 0 24 24"
										fill="currentColor"
										aria-hidden="true"
									>
										<rect x="6" y="5" width="4" height="14" rx="1" />
										<rect x="14" y="5" width="4" height="14" rx="1" />
									</svg>
								{/if}
							</button>
						{/if}
						<div class="marquee-track" bind:this={marqueeTrack}>
							{#each bartendingPhotos as photo (photo.src)}
								<button
									type="button"
									onclick={() => openLightbox(photo.src, photo.alt)}
									class="h-48 flex-shrink-0 cursor-pointer rounded-lg sm:h-56"
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
									class="h-48 flex-shrink-0 cursor-pointer rounded-lg sm:h-56"
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
			</Card>
		{/each}
	</ul>
</SectionWrapper>

{#if lightboxOpen}
	<!--
		The lightbox renders here, at the end of the component, but it is opened from
		a photo button far above. Without `use:dialog` focus stayed on that button, so
		reaching this Close control meant tabbing through the nine remaining photos and
		every section below — all of it behind the overlay.

		The `e.target === e.currentTarget` guard is what lets the image sit directly in
		the backdrop: a click on the photo is not a click on the backdrop, so the old
		stopPropagation wrapper (and its blanket eslint-disable, which suppressed every
		rule on that line) is no longer needed.
	-->
	<!--
		Escape comes from `use:dialog` and the Close button is the first thing focused
		on open, so the click handler is a pointer convenience, not the only exit.
	-->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-label="Photo preview"
		tabindex="-1"
		use:dialog={{ onclose: closeLightbox }}
		onclick={(e) => {
			if (e.target === e.currentTarget) closeLightbox();
		}}
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
		<img
			src={lightboxSrc}
			alt={lightboxAlt}
			class="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
		/>
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
