<script lang="ts">
	import Hero from '$lib/components/sections/Hero.svelte';
	import About from '$lib/components/sections/About.svelte';
	import Experience from '$lib/components/sections/Experience.svelte';
	import Education from '$lib/components/sections/Education.svelte';
	import Skills from '$lib/components/sections/Skills.svelte';
	import Projects from '$lib/components/sections/Projects.svelte';
	import Interests from '$lib/components/sections/Interests.svelte';
</script>

<svelte:head>
	<title>Ryan Critchlow | Portfolio</title>
	<meta name="description" content="Ryan Critchlow - MS Computer Science (HCI) student, researcher, and software engineer. Portfolio showcasing research, projects, and experience." />
</svelte:head>

<Hero />
<About />
<Experience />
<Education />
<Skills />
<Projects />
<Interests />
