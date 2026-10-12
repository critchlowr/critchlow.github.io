import type {
	Experience,
	Education,
	Project,
	Publication,
	ContactLink,
	SkillCategory
} from '$lib/types';

export const hero = {
	name: 'Ryan Critchlow',
	tagline: 'Product · Research · Enterprise Systems',
	summary:
		'I spent three years administering warehouse management systems at Körber, running four enterprise accounts and turning what warehouse managers needed into specs, SQL reporting, and scoped work. Then I went back for an M.S. in Computer Science and spent a year and a half owning a research project end to end: planning the build, recruiting families, running the study, and coding the analysis. I like the part of the job where you decide what gets built and why.',
	availability:
		'Open to product, solutions, analytics, and accessibility roles. Pacific Northwest or remote.',
	resumeHref: '/Ryans_Resume_2026.pdf'
};

export const about = {
	heading: 'About Me',
	paragraphs: [
		"I'm interested in the work that happens before the code. Figuring out what people need, deciding what gets built, and keeping the thing that ships close to the problem it started with. I've done versions of that as a support analyst, as a graduate researcher, and now in a wood shop.",
		"The route here was not linear. I finished a degree in Management of Information Systems, then spent three years at Körber Supply Chain administering warehouse management systems for four enterprise accounts. When HR blocked my move into software development because I didn't have a CS degree, I went back to Western for an M.S. instead. I've been a bartender and a carpenter along the way, and I'm a carpenter again now.",
		"Most of what I know about building for people I learned in the KIND Lab. I built a game to help autistic children practice pronouns, then scrapped my own approved study design because I had planned the whole thing for those kids without involving any of them. The replacement put me in four families' living rooms watching them play. That's still the best decision I've made on a project.",
		"When I'm not working you'll find me on a trail with Georgia, my chocolate lab, training for my next half marathon, or behind a bar making cocktails. I'm into road biking, reading, and the occasional long video game session. I like being outside as much as I can."
	]
};

export const experience: Experience[] = [
	{
		title: 'Carpenter',
		company: 'Atlas Woodworks',
		location: 'Bellingham, WA',
		period: 'January 2026 – Present',
		bullets: [
			'Restoration, custom interior and exterior millwork, and casework installation for a worker-owned shop in Whatcom County. Started part time while finishing my M.S. and moved to full time in June 2026',
			"Took over the shop's Squarespace site, handling content and structure updates",
			'Moving into material takeoffs for millwork projects: reading drawings, quantifying materials, and scoping jobs before they reach the floor'
		],
		tags: ['Estimating', 'Scoping', 'Client Work']
	},
	{
		title: 'Graduate Researcher',
		company: 'Western Washington University — KIND Lab',
		location: 'Bellingham, WA',
		period: 'Winter 2025 – June 2026',
		bullets: [
			'Designed a complete user study and research proposal, including literature review, survey instruments, assessment methodology, and data collection plans; mentored an undergraduate researcher in amending the IRB protocol to add an in-home co-design pilot',
			'Planned and managed a multi-phase delivery timeline of build, recruit, evaluate, analyze, and write, launching a recruitment campaign across Western Washington via snowball sampling and re-sequencing phases to absorb a quarter-long recruiting delay',
			'Conducted an in-home participatory evaluation with four neurodivergent children and their families following the Co-Design Beyond Words methodology, developing semi-structured pre- and post-gameplay caregiver interview protocols, child-facing visual survey instruments, and dual video/audio recording setups across sessions averaging 85 minutes',
			"Applied Braun and Clarke's inductive thematic coding to caregiver interview transcripts across three coding rounds; separately coded video recordings for emotional engagement cues",
			'Translated practitioner insights from speech-language pathologists and co-design sessions into a working prototype in C#, Unity, and WebGL, leading technical implementation and art direction'
		],
		tags: ['Research', 'Delivery', 'Requirements']
	},
	{
		title: 'Support Analyst L4',
		company: 'Körber Supply Chain (now Infios)',
		location: 'Bellingham, WA',
		period: '2020 – 2023',
		bullets: [
			'Managed four enterprise customer accounts, double the team average of two, coordinating stakeholders on process development and change controls and serving as primary technical point of contact across the portfolio',
			'Gathered requirements from enterprise stakeholders and translated them into custom SQL reporting and web-based deliverables, weighing technical complexity against business urgency and achieving 46% more stable releases than the department average',
			'Re-aligned stakeholder expectations when requests conflicted with technical feasibility, contracted hours, or SLA commitments, and wrote requirement specs for engineering handoff on scope-exceeding work',
			'Performance-tuned and optimized SQL workloads using CTEs, stored procedures, indexing, and automation via SQL Server Agent, resolving deadlocks on high-traffic production systems',
			"Isolated faults across system boundaries, using WMS data to establish whether an issue originated in the warehouse system, the customer's order management system, Dynamics 365, or their network, and escalated to the responsible team with the evidence behind it",
			'Worked from a cloud operations dashboard to identify platform outages and separate them from application faults, supporting both cloud-hosted and on-premise customers',
			'Ran system upgrades across dev, test, and production environments for customers through the HighJump to Körber rebrand',
			'Served as on-site technical lead at two system Go-Lives and one improvement trip, resolving bugs and refining process flows with users in real time',
			'Wrote and maintained knowledgebase documentation for every account I managed, and trained the secondary analysts on each account from it',
			'Co-led a four-person initiative to develop a 30/60/90 onboarding framework, cutting new-hire ramp time by 50%, and trained four enterprise customers through a NetSuite-to-ServiceNow migration'
		],
		tags: ['Stakeholder Mgmt', 'Requirements', 'T-SQL', 'Reporting'],
		showSimulator: true
	},
	{
		title: 'Graduate Teaching Assistant',
		company: 'Western Washington University',
		location: 'Bellingham, WA',
		period: '2024 – 2025',
		bullets: [
			'Supported 30+ students per quarter across DATA 311 (Fundamentals of Data Science), CSCI 102 (Computer Mediated Communications), and CSCI 345 (Object-Oriented Design)',
			'Taught Python, pandas, NumPy, and data visualization in DATA 311; UML modeling and design patterns in CSCI 345',
			'Translated technical assignment requirements into clearer language for students and refined rubrics to clarify expectations across course material'
		]
	},
	{
		title: 'Bartender',
		company: 'Redlight',
		location: 'Bellingham, WA',
		period: '2023 – 2025',
		bullets: ['Made cocktails in a fast-paced downtown bar to finance graduate school'],
		showBartendingPhotos: true
	},
	{
		title: 'Bartender',
		company: 'Aslan Brewing Company',
		location: 'Bellingham, WA',
		period: 'March 2018 – March 2020',
		bullets: ['Bartended through my undergraduate degree']
	},
	{
		title: 'Carpenter',
		company: 'Bespoke Construction',
		location: 'Bellingham, WA',
		period: '2015 – 2017',
		bullets: ['Custom residential construction and finish carpentry']
	}
];

export const education: Education[] = [
	{
		school: 'Western Washington University',
		degree: 'Master of Science in Computer Science',
		location: 'Bellingham, WA',
		period: 'Awarded June 2026',
		notes: [
			'Human-Computer Interaction, accessible educational technology, participatory design',
			'Advisor: Dr. Yasmine Elglaly'
		]
	},
	{
		school: 'Western Washington University',
		degree: 'Bachelor of Arts in Management of Information Systems',
		location: 'Bellingham, WA',
		period: 'Awarded June 2020',
		notes: [
			'Minor in Data Analytics',
			'Coursework: Business Intelligence & Analytics, Predictive Analytics for Business, Applied Text Analytics, Systems Analysis & Design, Project Management'
		]
	}
];

export const credentials = {
	orcid: '0009-0007-7323-9177',
	orcidHref: 'https://orcid.org/0009-0007-7323-9177',
	// ORCID publishes the iD icon for exactly this use and licenses it openly, so it
	// is served from static/. ACM's logo is a restricted trademark, so the membership
	// chip is set typographically instead — see Research.svelte.
	membership: 'ACM Member',
	membershipDetail: 'Association for Computing Machinery, 2026–present'
};

export const skills: SkillCategory[] = [
	{
		label: 'Product & Process',
		items: [
			'Requirements Gathering',
			'Stakeholder Management',
			'Prioritization & Tradeoff Analysis',
			'Scope & Change Control',
			'Cross-Functional Collaboration',
			'Agile Ceremonies',
			'Escalation Management',
			'Onboarding & Training'
		]
	},
	{
		label: 'Research & Synthesis',
		items: [
			'Qualitative Research',
			'User Interviews',
			'Participatory Design',
			'Thematic Analysis',
			'Survey Design',
			'Iterative Prototyping',
			'IRB Protocols',
			'WCAG 2.2 Accessibility Standards'
		]
	}
];

export const tools = [
	{ name: 'T-SQL', icon: 'microsoftsqlserver/microsoftsqlserver-original' },
	{ name: 'Python', icon: 'python/python-original' },
	{ name: 'C#', icon: 'csharp/csharp-original' },
	{ name: 'Java', icon: 'java/java-original' },
	{ name: 'JavaScript', icon: 'javascript/javascript-original' },
	// Devicon has no Power BI or Tableau mark; a wrong logo is worse than none.
	{ name: 'Power BI' },
	{ name: 'Tableau' },
	{ name: 'MySQL', icon: 'mysql/mysql-original' },
	{ name: 'Git', icon: 'git/git-original' },
	{ name: 'Unity', icon: 'unity/unity-original' },
	{ name: 'Svelte', icon: 'svelte/svelte-original' },
	{ name: 'Tailwind', icon: 'tailwindcss/tailwindcss-original' }
];

export const selectedWork: Project[] = [
	{
		title: 'You and I',
		description:
			'A Unity game that helps autistic gestalt language learners practice pronouns, built for an in-home participatory evaluation with four families. I owned it end to end, including the art.',
		tools: 'Unity, C#, WebGL',
		period: '2025 – 2026',
		bullets: []
	},
	{
		title: 'WMS Simulator',
		description:
			'A playable simulation of the wave, pick, stage, pack, load, and ship flow I administered for three years, including what happens when a picker reaches an empty location. Built to explain the domain to people who have never worked in it.',
		tools: 'Svelte, TypeScript',
		period: '2026',
		bullets: [],
		action: 'simulator',
		hrefLabel: 'Play it'
	},
	{
		title: 'KIND Lab Website',
		description:
			"The website for Western's KIND Lab, built so the group's research is legible to people outside it.",
		tools: 'Web Development',
		period: '2025',
		bullets: [],
		href: 'https://thekindlab.github.io/',
		hrefLabel: 'thekindlab.github.io',
		external: true
	},
	{
		title: 'Atlas Northwest',
		description:
			'Content and structure work on the site for the woodshop I work at, covering their restoration and millwork portfolio.',
		tools: 'Squarespace',
		period: '2026',
		bullets: [],
		href: 'https://atlasnorthwest.com',
		hrefLabel: 'atlasnorthwest.com',
		external: true
	}
];

export const publications: Publication[] = [
	{
		id: 'pub-ableism-sneaking-in',
		authors: 'Yasmine N. Elglaly, Ryan Critchlow, Katherine Baker, and Kristen Shinohara',
		title:
			'Ableism Sneaking In: A Literature Review of Disability Misconceptions in Computing Education',
		venue:
			'To appear in Proceedings of the 28th International ACM SIGACCESS Conference on Computers and Accessibility (ASSETS 2026), Porto, Portugal, October 2026',
		status: 'published',
		honor: 'Nominated for the Social Impact Award',
		summary:
			"The paper examines how accessibility coursework can produce measurable knowledge gains in students while their reflections still contain ableist framings, including deficit-based language, unsubstantiated claims about assistive technology, and erasure of disabled people's agency.",
		contribution:
			'Coded all 35 papers in the review corpus against a codebook the research team had developed iteratively, and helped identify six recurring patterns of ableism. A second researcher reviewed the coding for consistency. This is my first conference presentation.'
	},
	{
		id: 'pub-you-and-i',
		authors: 'Ryan Critchlow, Yasmine N. Elglaly, Clare Gaskill, and Tyanin Opdahl',
		title:
			'You and I: A Participatory Evaluation Study of a Serious Game to Practice Pronouns for Autistic Children',
		venue:
			'In preparation for ACM Interaction Design and Children (IDC 2027), submitting January 2027',
		status: 'in-preparation',
		contribution:
			'First author. I planned the build, ran recruitment, designed the instruments, ran the in-home sessions, and coded the analysis. Findings are held until publication.',
		href: 'https://idc.acm.org/2027/calls/',
		hrefLabel: 'IDC 2027 call for papers',
		external: true
	},
	{
		id: 'pub-motivation-alt-text',
		authors: 'Thuan Nguyen, Selah Bellscheidt, Yasmine N. Elglaly, and Ryan Critchlow',
		title:
			'Motivation Yields Better Alt Text: A Study of Design Triggers that Encourage Authoring Behavior',
		venue: 'Target venue TBD, in preparation',
		status: 'in-preparation',
		contribution:
			'I joined after the original authors had graduated and the paper had been rejected from a prior conference. I revised the discussion section for resubmission, addressed reviewer feedback, and worked with the faculty advisor to bring the manuscript back to submission readiness.'
	}
];

export const contact: ContactLink[] = [
	{
		label: 'Email',
		href: 'mailto:critchlow.rc@gmail.com',
		icon: 'email',
		display: 'critchlow.rc@gmail.com'
	},
	{
		label: 'Phone',
		href: 'tel:+13609416785',
		icon: 'phone',
		display: '(360) 941-6785'
	},
	{
		label: 'LinkedIn',
		href: 'https://linkedin.com/in/ryan-critchlow',
		icon: 'linkedin',
		display: 'ryan-critchlow'
	},
	{
		label: 'GitHub',
		href: 'https://github.com/critchlowr',
		icon: 'github',
		display: 'critchlowr'
	},
	{
		label: 'Resume',
		href: '/Ryans_Resume_2026.pdf',
		icon: 'resume',
		display: 'Resume (PDF)'
	}
];

export const navLinks = [
	{ label: 'About', href: '/#about' },
	{ label: 'Experience', href: '/#experience' },
	{ label: 'Work', href: '/#work' },
	{ label: 'Simulator', href: '/#simulator' },
	{ label: 'Research', href: '/#research' },
	{ label: 'Skills', href: '/#skills' },
	{ label: 'Education', href: '/#education' },
	{ label: 'Contact', href: '/#contact' }
];
