<script lang="ts">
	/**
	 * A conveyor that delivers its boxes once, when it scrolls into view, then stops.
	 *
	 * - Without JavaScript, or with reduced motion on, the boxes simply sit on the belt.
	 *   Both the parked start and the run are inside a `no-preference` media query, so
	 *   reduced motion never sees either (WCAG 2.2.2, 2.3.3).
	 * - "Run the belt again" replays it by re-creating the belt, which restarts the CSS
	 *   animation. The button only exists when motion is allowed.
	 */
	import { prefersReducedMotion } from 'svelte/motion';

	let root = $state<HTMLElement>();
	let armed = $state(false);
	let playing = $state(false);
	let delivered = $state(false);
	let run = $state(0);

	$effect(() => {
		const el = root;
		if (!el) return;
		armed = true;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				playing = true;
				observer.disconnect();
			},
			{ threshold: 0.6 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	});

	function replay() {
		run += 1;
		playing = true;
	}
</script>

<div class="belt relative pt-9 select-none" class:armed class:playing bind:this={root}>
	<div class="relative h-10 overflow-hidden" aria-hidden="true">
		{#key run}
			<!-- The track and boxes travel together, so the belt reads as carrying them. -->
			<div
				class="belt-content"
				onanimationend={(e) => {
					if (e.target === e.currentTarget) delivered = true;
				}}
			>
				<div class="belt-track"></div>
				<div class="belt-segment">
					<div class="box bottom-3 left-[5%] h-5 w-5"></div>
					<div class="box bottom-3 left-[14%] h-3.5 w-3.5"></div>
					<div class="box bottom-3 left-[40%] h-6 w-6"></div>
					<div class="box bottom-3 left-[72%] h-4 w-4"></div>
				</div>
				<div class="belt-segment"></div>
			</div>
		{/key}
		<!-- Rollers stay fixed in place. -->
		<div class="belt-rollers">
			{#each { length: 30 } as _, i (i)}
				<span class="roller"></span>
			{/each}
		</div>
	</div>
	<!-- `delivered` is false until after hydration, so the media query never causes a mismatch. -->
	{#if delivered && !prefersReducedMotion.current}
		<button type="button" class="replay text-ink-muted hover:text-ink-strong" onclick={replay}>
			Run the belt again
		</button>
	{/if}
</div>

<style>
	.belt-content {
		position: relative;
		display: flex;
		width: 200%;
		height: 100%;
	}

	.belt-segment {
		width: 50%;
		height: 100%;
		position: relative;
		flex-shrink: 0;
	}

	/* The belt has no ground of its own: the track and boxes sit on the page. */
	.belt {
		--belt-line: var(--t-ink-muted);
	}

	:global(.dark) .belt {
		--belt-line: var(--t-edge-hover);
	}

	.belt-track {
		position: absolute;
		bottom: 6px;
		left: 0;
		width: 100%;
		height: 2px;
		background: repeating-linear-gradient(to right, var(--belt-line) 0 6px, transparent 6px 12px);
	}

	/* Taped cartons, in the same cardboard and ink as the simulator's. */
	.box {
		position: absolute;
		border-radius: 3px;
		border: 1.5px solid #3b2a1e;
		background: #e6bd85
			linear-gradient(
				to bottom,
				transparent calc(50% - 1.5px),
				#b77a3c calc(50% - 1.5px),
				#b77a3c calc(50% + 1.5px),
				transparent calc(50% + 1.5px)
			);
	}

	:global(.dark) .box {
		outline: 1px solid rgb(255 248 235 / 0.8);
	}

	.belt-rollers {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 1;
		display: flex;
		justify-content: space-between;
		padding: 0 4px;
		pointer-events: none;
	}

	.roller {
		display: block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		border: 1.5px solid var(--belt-line);
		background: var(--t-surface);
	}

	.replay {
		position: absolute;
		top: 0.5rem;
		right: 0;
		font-size: 0.8125rem;
		font-weight: 600;
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	@media (prefers-reduced-motion: no-preference) {
		/* Parked: the empty half of the belt is showing, the boxes wait off to the left. */
		.armed .belt-content {
			transform: translateX(-50%);
		}

		.playing .belt-content {
			animation: deliver 1.8s cubic-bezier(0.22, 0.61, 0.36, 1) both;
		}

		.playing .box {
			animation: box-bounce 0.3s ease-in-out 5;
		}

		.playing .box:nth-child(2n) {
			animation-delay: 0.12s;
		}
	}

	@keyframes deliver {
		from {
			transform: translateX(-50%);
		}
		to {
			transform: translateX(0);
		}
	}

	@keyframes box-bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-2px);
		}
	}
</style>
