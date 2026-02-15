<script lang="ts">
	import { inview } from '$lib/actions/inview';
	import SectionWrapper from '$lib/components/ui/SectionWrapper.svelte';

	const skillCategories = [
		{
			label: 'Languages',
			skills: [
				{ name: 'Java', icon: 'java/java-original' },
				{ name: 'Python', icon: 'python/python-original' },
				{ name: 'C#', icon: 'csharp/csharp-original' },
				{ name: 'C', icon: 'c/c-original' },
				{ name: 'JavaScript', icon: 'javascript/javascript-original' },
				{ name: 'T-SQL', icon: 'microsoftsqlserver/microsoftsqlserver-original' },
				{ name: 'HTML', icon: 'html5/html5-original' },
				{ name: 'CSS', icon: 'css3/css3-original' }
			]
		},
		{
			label: 'Frameworks & Tools',
			skills: [
				{ name: 'Git', icon: 'git/git-original' },
				{ name: 'Unity', icon: 'unity/unity-original' },
				{ name: 'Svelte', icon: 'svelte/svelte-original' },
				{ name: 'Tailwind', icon: 'tailwindcss/tailwindcss-original' },
				{ name: 'MySQL', icon: 'mysql/mysql-original' },
				{ name: 'Linux', icon: 'linux/linux-original' },
				{ name: 'Power BI', icon: 'azure/azure-original' },
				{ name: 'Tableau', icon: 'firebase/firebase-original' }
			]
		},
		{
			label: 'Research & Specializations',
			specializations: [
				'WCAG 2.1 Accessibility Standards',
				'Human-Computer Interaction Design',
				'Database Optimization & Performance Tuning',
				'Agile Project Management',
				'Accessible Educational Technology'
			]
		}
	];

	const devIconBase = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons';
</script>

<SectionWrapper id="skills" headingId="skills-heading" number="04" title="Skills" alt>
	<div class="space-y-10">
		{#each skillCategories as category}
			<div>
				<h3 class="mb-4 text-sm font-semibold uppercase tracking-wider text-warm-700 dark:text-warm-300">
					{category.label}
				</h3>
				{#if category.skills}
					<div class="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" use:inview>
						{#each category.skills as skill}
							<div class="flex items-center gap-3 rounded-lg border border-warm-200 bg-white px-4 py-3 transition-all hover:border-accent-300 hover:shadow-sm dark:border-warm-700 dark:bg-warm-800 dark:hover:border-accent-600">
								<img
									src="{devIconBase}/{skill.icon}.svg"
									alt=""
									class="h-7 w-7"
									loading="lazy"
									aria-hidden="true"
								/>
								<span class="text-sm font-medium text-warm-700 dark:text-warm-300">{skill.name}</span>
							</div>
						{/each}
					</div>
				{:else if category.specializations}
					<div class="flex flex-wrap gap-2">
						{#each category.specializations as spec}
							<span class="rounded-full bg-moss-100 px-4 py-1.5 text-sm font-medium text-moss-700 dark:bg-moss-800 dark:text-moss-200">
								{spec}
							</span>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</SectionWrapper>
