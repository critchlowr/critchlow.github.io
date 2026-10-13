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
	let root = $state<HTMLElement>();
	let armed = $state(false);
	let playing = $state(false);
	let delivered = $state(false);
	let run = $state(0);
	let motionOK = $state(false);

	$effect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: no-preference)');
		const sync = () => (motionOK = query.matches);
		sync();
		query.addEventListener('change', sync);
		return () => query.removeEventListener('change', sync);
	});

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

<div
	class="bg-warm-100 dark:bg-warm-800 relative rounded-b-xl pt-9 pb-3 select-none"
	class:armed
	class:playing
	bind:this={root}
>
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
	{#if motionOK && delivered}
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

	.belt-track {
		position: absolute;
		bottom: 6px;
		left: 0;
		width: 100%;
		height: 2px;
		background: repeating-linear-gradient(
			to right,
			var(--color-warm-600) 0px,
			var(--color-warm-600) 6px,
			transparent 6px,
			transparent 12px
		);
	}

	:global(.dark) .belt-track {
		background: repeating-linear-gradient(
			to right,
			var(--color-warm-400) 0px,
			var(--color-warm-400) 6px,
			transparent 6px,
			transparent 12px
		);
	}

	.box {
		position: absolute;
		border-radius: 3px;
		border: 1px solid var(--color-ember-500);
		background-color: var(--color-ember-50);
	}

	:global(.dark) .box {
		border-color: var(--color-ember-400);
		background-color: var(--color-ember-900);
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
		border: 1.5px solid var(--color-warm-600);
	}

	:global(.dark) .roller {
		border-color: var(--color-warm-400);
	}

	.replay {
		position: absolute;
		top: 0.5rem;
		right: 1rem;
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
