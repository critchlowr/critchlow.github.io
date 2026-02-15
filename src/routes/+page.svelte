<script lang="ts">
	import Hero from '$lib/components/sections/Hero.svelte';
	import About from '$lib/components/sections/About.svelte';
	import Experience from '$lib/components/sections/Experience.svelte';
	import Education from '$lib/components/sections/Education.svelte';
	import Skills from '$lib/components/sections/Skills.svelte';
	import Projects from '$lib/components/sections/Projects.svelte';

</script>

<svelte:head>
	<title>Ryan Critchlow | Software Engineer & HCI Researcher</title>
	<meta name="description" content="Ryan Critchlow - MS Computer Science (HCI) student, researcher, and software engineer. Portfolio showcasing research, projects, and experience." />
	<meta property="og:title" content="Ryan Critchlow" />
	<meta property="og:description" content="Software Engineer & HCI Researcher" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://ryancritchlow.com" />
	<meta property="og:image" content="https://ryancritchlow.com/images/ryancritchlow.jpeg" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Ryan Critchlow" />
	<meta name="twitter:description" content="Software Engineer & HCI Researcher" />
	<meta name="twitter:image" content="https://ryancritchlow.com/images/ryancritchlow.jpeg" />
</svelte:head>

<Hero />
<About />
<Experience />
<Education />
<Skills />
<Projects />
