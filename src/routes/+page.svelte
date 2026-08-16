<script lang="ts">
	import Hero from '$lib/components/sections/Hero.svelte';
	import About from '$lib/components/sections/About.svelte';
	import Experience from '$lib/components/sections/Experience.svelte';
	import Work from '$lib/components/sections/Work.svelte';
	import Simulator from '$lib/components/sections/Simulator.svelte';
	import Research from '$lib/components/sections/Research.svelte';
	import Skills from '$lib/components/sections/Skills.svelte';
	import Education from '$lib/components/sections/Education.svelte';

	const description =
		'Ryan Critchlow turns what people need into scoped, buildable work. Three years running enterprise warehouse management accounts, an M.S. in Computer Science, and a graduate research practice in accessible educational technology.';

	const personSchema = {
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: 'Ryan Critchlow',
		url: 'https://ryancritchlow.com',
		image: 'https://ryancritchlow.com/images/ryancritchlow.jpeg',
		email: 'mailto:critchlow.rc@gmail.com',
		jobTitle: 'Product, Solutions, and Business Analysis',
		identifier: 'https://orcid.org/0009-0007-7323-9177',
		alumniOf: {
			'@type': 'CollegeOrUniversity',
			name: 'Western Washington University'
		},
		knowsAbout: [
			'Product Management',
			'Requirements Gathering',
			'Business Analysis',
			'Business Intelligence',
			'Solutions Engineering',
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
	<title>Ryan Critchlow | Product · Research · Enterprise Systems</title>
	<meta name="description" content={description} />
	<meta property="og:title" content="Ryan Critchlow" />
	<meta property="og:description" content="Product · Research · Enterprise Systems" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://ryancritchlow.com" />
	<meta property="og:image" content="https://ryancritchlow.com/images/ryancritchlow.jpeg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Ryan Critchlow" />
	<meta name="twitter:description" content="Product · Research · Enterprise Systems" />
	<meta name="twitter:image" content="https://ryancritchlow.com/images/ryancritchlow.jpeg" />
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
<Work />
<Simulator />
<Research />
<Skills />
<Education />
