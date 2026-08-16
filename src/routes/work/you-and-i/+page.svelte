<script lang="ts">
	const meta = [
		{ label: 'When', value: 'Winter 2025 – June 2026' },
		{ label: 'Where', value: 'WWU KIND Lab' },
		{ label: 'Role', value: 'Lead researcher' },
		{ label: 'Built with', value: 'Unity, C#, WebGL' }
	];
</script>

<svelte:head>
	<title>You and I | Ryan Critchlow</title>
	<meta
		name="description"
		content="You and I is a 2D serious game designed for in-home co-play between autistic children and their caregivers, introducing pronoun scaffolding for gestalt language processors. An in-home participatory evaluation with four families."
	/>
	<meta property="og:title" content="You and I — case study" />
	<meta
		property="og:description"
		content="A serious game introducing pronoun scaffolding for gestalt language processors, evaluated in-home with four families."
	/>
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://ryancritchlow.com/work/you-and-i" />
	<meta property="og:image" content="https://ryancritchlow.com/images/you-and-i/title.webp" />
</svelte:head>

<article class="bg-warm-50 dark:bg-warm-900">
	<div class="mx-auto max-w-4xl px-4 py-16 pt-28 md:py-24 md:pt-32">
		<a
			href="/#work"
			class="text-warm-600 dark:text-warm-400 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
		>
			<span aria-hidden="true">&larr;</span> Back to work
		</a>

		<h1
			class="text-primary-800 dark:text-primary-200 mt-6 text-3xl font-bold tracking-tight sm:text-4xl"
		>
			You and I
		</h1>
		<p class="text-warm-700 dark:text-warm-300 mt-4 text-lg leading-relaxed">
			A 2D serious game designed for in-home co-play between autistic children and their caregivers,
			introducing pronoun scaffolding for gestalt language processors.
		</p>

		<dl
			class="border-warm-200 dark:border-warm-700 mt-8 grid grid-cols-2 gap-4 border-y py-6 sm:grid-cols-4"
		>
			{#each meta as item (item.label)}
				<div>
					<dt
						class="text-warm-600 dark:text-warm-400 text-sm font-semibold tracking-wider uppercase"
					>
						{item.label}
					</dt>
					<dd class="text-warm-700 dark:text-warm-300 mt-1 text-sm">{item.value}</dd>
				</div>
			{/each}
		</dl>

		<img
			src="/images/you-and-i/title.webp"
			alt="The You and I title screen: a hand-drawn child character standing under a yellow arch reading 'You and I', with smiling clouds and a sun, above a 'Get Started!' button."
			class="border-warm-200 dark:border-warm-700 mt-10 w-full rounded-xl border shadow-sm"
			width="1400"
			height="788"
		/>

		<h2 class="text-primary-700 dark:text-primary-200 mt-14 text-2xl font-bold">
			Gestalt language processing and pronoun reversal
		</h2>
		<p class="text-warm-700 dark:text-warm-300 mt-4 leading-relaxed">
			Most people acquire language analytically, learning to build longer sentences word by word.
			There is another way. Gestalt language processors begin with longer sentences and learn how to
			break them down and mix and match. Those longer sentences are memorized chunks, known as
			gestalt phrases, and they lead to scripting back phrases the child has heard verbatim. Instead
			of "I want a snack," a child might repeat "Do you want a snack?" because that is the script
			they heard.
		</p>
		<p class="text-warm-700 dark:text-warm-300 mt-4 leading-relaxed">
			Scripting like this often leads to pronoun reversal, where "you" is learned in place of "I"
			since that is how the child is referred to. Pronouns are hard on their own, and using them
			correctly takes more than grammar: it takes theory of mind, social cognition, and memory. When
			pronouns are misaligned it can lead to social isolation and reduced joint attention, and joint
			attention is itself foundational to learning pronouns.
		</p>

		<h2 class="text-primary-700 dark:text-primary-200 mt-14 text-2xl font-bold">
			Where that left us
		</h2>
		<p class="text-warm-700 dark:text-warm-300 mt-4 leading-relaxed">
			Three separate systematic reviews from 2024 showed that existing language tools for autistic
			children target vocabulary and social skills, not gestalts or perspective-taking. There is
			work that introduced pronouns using a mirrored avatar to help introduce the "self"
			perspective, but they never tested it with children.
		</p>
		<p class="text-warm-700 dark:text-warm-300 mt-4 leading-relaxed">
			On joint media engagement, children get the most out of media when a caregiver engages
			alongside them, but that research focuses on turn-taking and social skills rather than
			language. On design guidelines, the literature gives useful principles: multimodal redundancy,
			familiar voices, simple age-appropriate language, and tapping rather than dragging as the
			default mechanic. But existing guidelines tie language to a child's age and ability. None of
			them speak to perspective-taking, or to the way gestalt language processors actually develop
			language.
		</p>
		<p class="text-warm-700 dark:text-warm-300 mt-4 leading-relaxed">
			The gap: no existing tools teach pronouns as deictic, perspective-shifting language for
			gestalt learners. That is what You and I does.
		</p>

		<h2 class="text-primary-700 dark:text-primary-200 mt-14 text-2xl font-bold">
			Introducing identity and language
		</h2>
		<p class="text-warm-700 dark:text-warm-300 mt-4 leading-relaxed">
			The game is built for dual participation, so parent and child play together and joint media
			engagement stays at the center. Identity comes next. Self-insertion is fundamental to
			perspective-taking, so the child builds a customizable avatar and can even put their own face
			on it. To keep play error-free there is no gamified testing and no wrong answers, just
			modeling and practice. We attempted to scaffold language in a gestalt-style way by introducing
			pronoun concepts in isolated chunks on a scene-by-scene basis: you and I in the produce aisle,
			he and she in baking, then the full mix later on.
		</p>

		<figure class="mt-8">
			<img
				src="/images/you-and-i/avatar.webp"
				alt="The avatar creation screen. A child character stands on the left under an editable name field reading 'Ryan', beside a panel of arrow controls for hair, eyes, skin colour, shirt, pants and shoes, with a 'Play Game!' button."
				class="border-warm-200 dark:border-warm-700 w-full rounded-xl border shadow-sm"
				width="1400"
				height="1044"
				loading="lazy"
			/>
			<figcaption class="text-warm-600 dark:text-warm-400 mt-2 text-sm">
				The child builds a customizable avatar. During gameplay the nametag sits under the chin,
				which keeps their gaze naturally forward toward the speaking character. If the avatar still
				does not feel like them, a selfie option lets them put their own face on the character.
			</figcaption>
		</figure>

		<p class="text-warm-700 dark:text-warm-300 mt-8 leading-relaxed">
			To introduce differing perspectives, the game centers on the main player and adds their two
			friends, Alice and Bob. The friends model pronouns between characters: "you" toward the
			player, "I" when a character means themself, "he" or "she" between the two. We surface the
			deictic shift by modeling that the same person is "you," "I," or "she/he" depending on who is
			speaking.
		</p>

		<figure class="mt-8">
			<img
				src="/images/you-and-i/scene-you-and-i.webp"
				alt="A grocery produce aisle in the game. Three child characters labelled Ryan, Alice, and Bob stand in front of shelves of carrots, pumpkins, corn and tomatoes. A speech bubble reads 'Ryan, could you help me find some strawberries?' with 'you' and 'me' in bold."
				class="border-warm-200 dark:border-warm-700 w-full rounded-xl border shadow-sm"
				width="1400"
				height="1048"
				loading="lazy"
			/>
			<figcaption class="text-warm-600 dark:text-warm-400 mt-2 text-sm">
				Two visual cues track who is speaking: characters turn to face the speaker, and speech
				bubbles follow whoever is talking.
			</figcaption>
		</figure>

		<p class="text-warm-700 dark:text-warm-300 mt-8 leading-relaxed">
			It is designed to be co-played, so the parent reads the dialogue aloud while the child
			navigates, which lets the parent scaffold perspective shifts as needed. When the child picks a
			wrong item, the feedback redirects them back into the story rather than marking them wrong.
		</p>

		<h2 class="text-primary-700 dark:text-primary-200 mt-14 text-2xl font-bold">
			The participatory evaluation
		</h2>
		<p class="text-warm-700 dark:text-warm-300 mt-4 leading-relaxed">
			It was important to build trust with the families before the studies, so we asked if we could
			bring anything that would help their child feel more comfortable. Calculators, bubbles,
			stickers, you name it. That, paired with the pre-gameplay caregiver interviews, gave us the
			chance to build trust with the children and get to know them on a personal level before
			engaging in research. During one session I watched TV with a child while they decided whether
			they wanted to play the game we made. Another researcher played on the trampoline and explored
			the yard.
		</p>
		<p class="text-warm-700 dark:text-warm-300 mt-4 leading-relaxed">
			This ended up being the first phase of the framework we followed, the foundation phase from
			Co-Design Beyond Words, a framework for getting design insight from non-verbal and minimally
			speaking children. After the pre-gameplay interviews we trained the parents and showed them
			how to introduce You and I to their child. That led to the second phase, the interaction
			phase, captured multimodally with video cameras so we could observe micro-interactions between
			the parent and their child, turn taking, and moments where the parent scaffolded to help with
			perspective confusion. After gameplay we ran a child-facing survey with laminated visual aids
			and concluded with a post-interview with the parent.
		</p>
		<p class="text-warm-700 dark:text-warm-300 mt-4 leading-relaxed">
			We concluded the framework with the reflection phase. All the audio from the pre and post
			interviews was transcribed verbatim by the lead researcher. Video recordings were transcribed
			for verbal content by another researcher and re-coded for emotional engagement cues. The lead
			researcher applied three rounds of inductive coding. Themes were proposed to the research
			group on sticky notes and we built an affinity diagram, which we reviewed together.
		</p>

		<h2 class="text-primary-700 dark:text-primary-200 mt-14 text-2xl font-bold">Findings</h2>
		<p class="text-warm-700 dark:text-warm-300 mt-4 leading-relaxed">
			We conducted in-home participatory design sessions with four families: three with autistic
			gestalt learners and one with Down syndrome. Data was collected through pre- and post-gameplay
			caregiver interviews, a post-gameplay child survey, and video recordings of gameplay sessions.
		</p>
		<p class="text-warm-700 dark:text-warm-300 mt-4 leading-relaxed">
			Our findings reveal that self-insertion, specifically mapping the player's own face onto their
			avatar, was central to resolving perspective confusion, with avatar customization alone
			falling short for some learners. Some gestalt learners benefit from atomic, phrase-level
			repetition targeting individual pronouns and verbs, rather than the scene-by-scene scaffolding
			the game proposed. Finally, we surface a tension between accessibility and learning: the
			design choices that reduced cognitive load for some learners enabled others to bypass pronoun
			content entirely.
		</p>

		<h2 class="text-primary-700 dark:text-primary-200 mt-14 text-2xl font-bold">
			Design recommendations
		</h2>
		<p class="text-warm-700 dark:text-warm-300 mt-4 leading-relaxed">
			First, perspective-taking needs a visual anchor. Children were confused about who their
			character was, and the selfie feature resolved it. And do not assume children grasp the
			teaching convention itself, like what a speech bubble does.
		</p>
		<p class="text-warm-700 dark:text-warm-300 mt-4 leading-relaxed">
			Second, match language to the child's natural language acquisition level, and use pronoun
			slotting so it is predictable where pronouns appear, keeping the structure stable while the
			material varies.
		</p>
		<p class="text-warm-700 dark:text-warm-300 mt-4 leading-relaxed">
			Third, existing text-to-speech can affect how children pronounce words, so families prefer a
			familiar-sounding voice. But they cannot sustain recording those voices, so researchers should
			ship the game with pre-recorded voices to minimize that workload.
		</p>
		<p class="text-warm-700 dark:text-warm-300 mt-4 leading-relaxed">
			Fourth, the same accessibility scaffolds, tapping instead of dragging and interactive hints,
			can let some children skip the learning. Customization by ability is essential: toggle motor
			accommodations and difficulty per learner, not by age.
		</p>

		<h2 class="text-primary-700 dark:text-primary-200 mt-14 text-2xl font-bold">
			Method takeaways
		</h2>
		<p class="text-warm-700 dark:text-warm-300 mt-4 leading-relaxed">
			Caregiver support groups were what actually yielded participants, and families screen research
			for its stance on neurodiversity. We recommend researchers state that up front, leading with a
			social model stance. Testing in real homes surfaced insights a lab would have hidden.
		</p>
		<p class="text-warm-700 dark:text-warm-300 mt-4 leading-relaxed">
			Feedback works best embedded in play. Only one of four children finished the post-session
			survey. We should have emphasized more of the Co-Design Beyond Words interaction components,
			to draw out microinteractions that would derive more meaning than a standardized
			questionnaire.
		</p>
		<p class="text-warm-700 dark:text-warm-300 mt-4 leading-relaxed">
			Gestalt language learners require a distinct design to support their learning. The manuscript
			is in preparation.
		</p>

		<div class="border-warm-200 dark:border-warm-700 mt-12 border-t pt-8">
			<a
				href="/#work"
				class="text-accent-700 dark:text-accent-300 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
			>
				<span aria-hidden="true">&larr;</span> Back to work
			</a>
		</div>
	</div>
</article>
