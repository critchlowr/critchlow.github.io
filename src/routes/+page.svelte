<script lang="ts">
	import Hero from '$lib/components/sections/Hero.svelte';
	import About from '$lib/components/sections/About.svelte';
	import Experience from '$lib/components/sections/Experience.svelte';
	import Publications from '$lib/components/sections/Publications.svelte';
	import Skills from '$lib/components/sections/Skills.svelte';
	import Education from '$lib/components/sections/Education.svelte';

	const description =
		'Ryan Critchlow: accessibility and UX research, and enterprise technical support. Peer-reviewed research at ASSETS 2026, an M.S. in Computer Science, and three years as an L4 support analyst on enterprise warehouse-management accounts.';

	const personSchema = {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: 'Ryan Critchlow',
		url: 'https://ryancritchlow.com',
		image: 'https://ryancritchlow.com/images/ryancritchlow.jpeg',
		email: 'mailto:critchlow.rc@gmail.com',
		jobTitle: 'Accessibility and UX Researcher; Technical Support Engineer',
		identifier: 'https://orcid.org/0009-0007-7323-9177',
		alumniOf: {
			'@type': 'CollegeOrUniversity',
			name: 'Western Washington University'
		},
		knowsAbout: [
			'UX Research',
			'Technical Support',
			'Troubleshooting',
			'Warehouse Management Systems',
			'SQL',
			'Human-Computer Interaction',
			'Accessibility',
			'Participatory Design'
		],
		sameAs: [
			'https://linkedin.com/in/ryan-critchlow',
			'https://github.com/critchlowr',
			'https://orcid.org/0009-0007-7323-9177'
		]
	};
</script>

<svelte:head>
	<title>Ryan Critchlow | Accessibility and UX research · Enterprise technical support</title>
	<meta name="description" content={description} />
	<meta property="og:title" content="Ryan Critchlow" />
	<meta
		property="og:description"
		content="Accessibility and UX research · Enterprise technical support"
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://ryancritchlow.com" />
	<meta property="og:image" content="https://ryancritchlow.com/images/og-card.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta
		property="og:image:alt"
		content="Ryan Critchlow — Accessibility and UX research · Enterprise technical support"
	/>
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Ryan Critchlow" />
	<meta
		name="twitter:description"
		content="Accessibility and UX research · Enterprise technical support"
	/>
	<meta name="twitter:image" content="https://ryancritchlow.com/images/og-card.png" />
	<!--
		personSchema is a static object defined above, not user input, so there is no
		injection surface here. The `<\/script>` escape is required: without it the HTML
		parser closes the surrounding script block early.
	-->
	<!-- eslint-disable-next-line svelte/no-at-html-tags, no-useless-escape -->
	{@html `<script type="application/ld+json">${JSON.stringify(personSchema)}<\/script>`}
</svelte:head>

<Hero />
<About />
<Experience />
<Publications />
<Skills />
<Education />
