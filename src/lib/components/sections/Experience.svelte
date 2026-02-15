<script lang="ts">
    import { experience } from "$lib/data/content";
    import { inview } from "$lib/actions/inview";
    import SectionWrapper from "$lib/components/ui/SectionWrapper.svelte";
    import ConveyorBelt from "$lib/components/ui/ConveyorBelt.svelte";

    let conveyorEl = $state<HTMLElement>();
    let conveyorVisible = $state(false);

    const bartendingPhotos = [
        { src: '/images/Bartending/pouring.jpeg', alt: 'Ryan pouring a cocktail' },
        { src: '/images/Bartending/nickandnora_cocktail.jpeg', alt: 'Cocktail in a nick and nora glass' },
        { src: '/images/Bartending/ryan_holdingdrink.jpeg', alt: 'Ryan holding a finished cocktail' },
        { src: '/images/Bartending/mercyandryan1.jpeg', alt: 'Ryan and coworker Mercy with a cocktail' },
        { src: '/images/Bartending/mercyandryan2.jpeg', alt: 'Ryan and Mercy behind the bar' },
        { src: '/images/Bartending/justinandryan1.jpeg', alt: 'Ryan and coworker Justin' },
        { src: '/images/Bartending/justinandryan2.jpeg', alt: 'Ryan and Justin behind the bar' },
        { src: '/images/Bartending/hollyandryan.jpeg', alt: 'Ryan and coworker Holly' },
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

<SectionWrapper
    id="experience"
    headingId="experience-heading"
    number="02"
    title="Experience"
    alt
>
    <div class="stagger-children space-y-4" use:inview>
        {#each experience as job}
            <div
                class="group rounded-xl border border-warm-200 bg-white p-6 transition-all hover:border-accent-300 hover:shadow-md dark:border-warm-700 dark:bg-warm-800 dark:hover:border-plum-400"
            >
                <div
                    class="flex flex-col justify-between gap-1 sm:flex-row sm:items-start"
                >
                    <div>
                        <h3
                            class="text-lg font-bold text-primary-700 dark:text-primary-200"
                        >
                            {job.title}
                        </h3>
                        <p
                            class="text-sm font-medium text-accent-600 dark:text-accent-300"
                        >
                            {job.company}
                        </p>
                    </div>
                    <div class="shrink-0 text-right">
                        <span
                            class="inline-block rounded-full bg-warm-100 px-3 py-0.5 text-sm font-medium text-warm-600 dark:bg-warm-700 dark:text-warm-300"
                            >{job.period}</span
                        >
                        <p
                            class="mt-1 text-sm text-warm-600 dark:text-warm-400"
                        >
                            {job.location}
                        </p>
                    </div>
                </div>
                {#if job.bullets.length > 0}
                    <ul class="mt-4 space-y-2">
                        {#each job.bullets as bullet}
                            <li
                                class="flex gap-2 text-sm leading-relaxed text-warm-600 dark:text-warm-400"
                            >
                                <span
                                    class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400"
                                    aria-hidden="true"
                                ></span>
                                <span>{bullet}</span>
                            </li>
                        {/each}
                    </ul>
                {/if}
                {#if job.company.includes("Körber")}
                    <div class="-mx-6 -mb-6 mt-4" bind:this={conveyorEl}>
                        <ConveyorBelt visible={conveyorVisible} />
                    </div>
                {/if}
            </div>
            {#if job.company.includes("Aslan")}
                <div class="photo-marquee overflow-hidden rounded-xl">
                    <div class="marquee-track">
                        {#each bartendingPhotos as photo}
                            <button
                                type="button"
                                onclick={() => openLightbox(photo.src, photo.alt)}
                                class="h-48 flex-shrink-0 cursor-pointer rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 sm:h-56"
                            >
                                <img
                                    src={photo.src}
                                    alt={photo.alt}
                                    class="h-full w-auto rounded-lg object-cover transition-transform hover:scale-105"
                                    loading="lazy"
                                />
                            </button>
                        {/each}
                        {#each bartendingPhotos as photo}
                            <button
                                type="button"
                                onclick={() => openLightbox(photo.src, photo.alt)}
                                class="h-48 flex-shrink-0 cursor-pointer rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-400 sm:h-56"
                                tabindex="-1"
                            >
                                <img
                                    src={photo.src}
                                    alt=""
                                    class="h-full w-auto rounded-lg object-cover transition-transform hover:scale-105"
                                    loading="lazy"
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
        onkeydown={(e) => { if (e.key === 'Escape') closeLightbox(); }}
        role="dialog"
        aria-label="Photo preview"
        tabindex="-1"
    >
        <button
            type="button"
            onclick={closeLightbox}
            class="absolute top-4 right-4 rounded-full bg-warm-800/60 p-2 text-white transition-colors hover:bg-warm-700"
            aria-label="Close photo"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        </button>
        <img
            src={lightboxSrc}
            alt={lightboxAlt}
            class="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onclick={(e) => e.stopPropagation()}
        />
    </div>
{/if}

<style>
    .marquee-track {
        display: flex;
        gap: 0.75rem;
        width: max-content;
        animation: marquee-scroll 25s linear infinite;
    }

    .photo-marquee:hover .marquee-track {
        animation-play-state: paused;
    }

    @keyframes marquee-scroll {
        from {
            transform: translateX(0);
        }
        to {
            transform: translateX(-50%);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .marquee-track {
            animation: marquee-scroll 50s linear infinite;
        }
    }
</style>
