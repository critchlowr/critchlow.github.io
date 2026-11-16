<script lang="ts">
	import Hero from '#lib/components/sections/Hero.svelte';
	import Experience from '#lib/components/sections/Experience.svelte';
	import Publications from '#lib/components/sections/Publications.svelte';
	import Skills from '#lib/components/sections/Skills.svelte';
	import Education from '#lib/components/sections/Education.svelte';
	import { publications } from '#lib/data/content.ts';

	const site = 'https://ryancritchlow.com';

	const description =
		'Ryan Critchlow is a UX researcher focused on accessibility, with a peer-reviewed paper presented at ASSETS 2026 and an M.S. in Computer Science concentrating in human-computer interaction.';

	const personSchema = {
		'@type': 'Person',
		'@id': `${site}/#person`,
		name: 'Ryan Critchlow',
		url: site,
		image: 'https://ryancritchlow.com/images/ryancritchlow.jpeg',
		email: 'mailto:critchlow.rc@gmail.com',
		jobTitle: 'UX Researcher',
		identifier: 'https://orcid.org/0009-0007-7323-9177',
		alumniOf: {
			'@type': 'CollegeOrUniversity',
			name: 'Western Washington University'
		},
		knowsAbout: [
			'UX Research',
			'Accessibility',
			'Human-Computer Interaction',
			'Participatory Design',
			'Qualitative Research',
			'Semi-Structured Interviews',
			'Thematic Analysis',
			'Survey Design'
		],
		sameAs: [
			'https://linkedin.com/in/ryan-critchlow',
			'https://github.com/critchlowr',
			'https://orcid.org/0009-0007-7323-9177'
		]
	};

	/*
		The ASSETS paper as a scholarly article. Title, authors, DOI and PDF come from
		the publications list, so this cannot drift from the Research section. The
		rest is from the paper's own front matter.
	*/
	const paper = publications.find((p) => p.status === 'published');
	const paperSchema = paper && {
		'@type': 'ScholarlyArticle',
		'@id': paper.href,
		headline: paper.title,
		name: paper.title,
		url: paper.href,
		sameAs: paper.href,
		identifier: {
			'@type': 'PropertyValue',
			propertyID: 'doi',
			value: paper.href?.replace('https://doi.org/', '')
		},
		author: paper.authors
			.split(/,\s*(?:and\s+)?/)
			.map((name) =>
				name === 'Ryan Critchlow' ? { '@id': personSchema['@id'] } : { '@type': 'Person', name }
			),
		datePublished: '2026-10',
		inLanguage: 'en',
		isPartOf: {
			'@type': 'CreativeWork',
			name: 'The 28th International ACM SIGACCESS Conference on Computers and Accessibility (ASSETS 2026)'
		},
		publisher: { '@type': 'Organization', name: 'Association for Computing Machinery' },
		license: 'https://creativecommons.org/licenses/by/4.0/',
		encoding: {
			'@type': 'MediaObject',
			contentUrl: `${site}${paper.pdfHref}`,
			encodingFormat: 'application/pdf'
		}
	};

	const schema = {
		'@context': 'https://schema.org',
		'@graph': paperSchema ? [personSchema, paperSchema] : [personSchema]
	};

	// Escaping `<` stops a closing script tag inside the data from ending the block.
	const jsonLd = JSON.stringify(schema).replace(/</g, '\\u003c');
</script>

<svelte:head>
	<title>Ryan Critchlow | UX researcher focused on accessibility</title>
	<meta name="description" content={description} />
	<meta property="og:title" content="Ryan Critchlow" />
	<meta property="og:description" content="UX researcher focused on accessibility" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://ryancritchlow.com" />
	<meta property="og:image" content="https://ryancritchlow.com/images/og-card.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Ryan Critchlow, UX researcher focused on accessibility" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Ryan Critchlow" />
	<meta name="twitter:description" content="UX researcher focused on accessibility" />
	<meta name="twitter:image" content="https://ryancritchlow.com/images/og-card.png" />
	<!--
		{@html} is the only way to emit a JSON-LD block. The data is static and escaped
		above. ESLint's Svelte parser fails on a bare closing script tag here, hence `<\/`.
	-->
	<!-- eslint-disable-next-line svelte/no-at-html-tags, no-useless-escape -->
	{@html `<script type="application/ld+json">${jsonLd}<\/script>`}
</svelte:head>

<!-- The introduction first, then the research and where it was done. -->
<Hero />
<Publications />
<Experience />
<div class="wrap grid gap-x-16 gap-y-16 py-16 md:py-24 lg:grid-cols-[2fr_3fr]">
	<Education />
	<Skills />
</div>
