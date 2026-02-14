<script lang="ts">
    import { experience } from "$lib/data/content";
    import { inview } from "$lib/actions/inview";
    import SectionWrapper from "$lib/components/ui/SectionWrapper.svelte";
    import ConveyorBelt from "$lib/components/ui/ConveyorBelt.svelte";

    let conveyorEl = $state<HTMLElement>();
    let conveyorVisible = $state(false);

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
                            class="text-lg font-semibold text-primary-700 dark:text-primary-300"
                        >
                            {job.title}
                        </h3>
                        <p
                            class="text-sm font-medium text-accent-600 dark:text-accent-400"
                        >
                            {job.company}
                        </p>
                    </div>
                    <div class="shrink-0 text-right">
                        <span
                            class="inline-block rounded-full bg-warm-100 px-3 py-0.5 text-xs font-medium text-warm-600 dark:bg-warm-700 dark:text-warm-300"
                            >{job.period}</span
                        >
                        <p
                            class="mt-1 text-xs text-warm-500 dark:text-warm-500"
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
        {/each}
    </div>
</SectionWrapper>
