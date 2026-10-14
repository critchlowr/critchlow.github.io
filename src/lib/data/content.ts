import type {
	Experience,
	Education,
	Publication,
	ContactLink,
	SkillCategory,
	Stat,
	Tool
} from '$lib/types';

export const hero = {
	name: 'Ryan Critchlow',
	tagline: 'Accessibility and UX research · Enterprise technical support',
	summary:
		'I study how people use technology, and I troubleshoot the enterprise systems they depend on. Peer-reviewed accessibility research at ASSETS 2026, an M.S. in Computer Science, and three years as an L4 support analyst on enterprise warehouse-management accounts at Körber.',
	status: 'At ASSETS 2026 in Porto, October 25–28.',
	availability:
		'Open to UX research, accessibility, and technical support roles in the Pacific Northwest or remote.',
	resumeHref: '/Ryans_Resume_2026.pdf'
};

// The headline numbers, pulled up from the Experience and Research sections so a
// skimming reader meets them first. Each one is stated in full further down the page.
export const stats: Stat[] = [
	{ value: 'ASSETS', label: 'peer-reviewed paper, ACM accessibility conference 2026' },
	{ value: '4', label: 'enterprise accounts run at once, double the team average' },
	{ value: '46%', label: 'more stable releases than the department average' },
	{ value: '50%', label: 'faster new-hire ramp from a 30/60/90 framework I co-led' }
];

export const about = {
	heading: 'About Me',
	paragraphs: [
		"I've been building things for people my whole life. Growing up with a carpenter for a dad, I learned to solve complex problems in unusual ways, with skills you don't pick up in a classroom. In graduate school I started building software for people, and designing it with them.",
		"The route here was not linear. I finished a degree in Management of Information Systems, then spent three years at Körber Supply Chain administering warehouse management systems for four enterprise accounts. When HR blocked my move into software development because I didn't have a CS degree, I went back to Western for an M.S. instead. I've been a bartender and a carpenter along the way, and I'm a carpenter again now.",
		"Most of what I know about building for people I learned in the KIND Lab. I built a game to help autistic children practice pronouns, then scrapped my own approved study design because I had planned the whole thing for those kids without involving any of them. The replacement put me in four families' living rooms watching them play. That's still the best decision I've made on a project.",
		"When I'm not working you'll find me on a trail with Georgia, my chocolate lab, training for my next half marathon, or behind a bar making cocktails. I'm into road biking, reading, and the occasional long video game session. I like being outside as much as I can."
	]
};

// Each role is one summary line plus at most three bullets. The full detail lives in
// the résumé PDF, which is one click away from every section.
export const experience: Experience[] = [
	{
		title: 'Carpenter',
		company: 'Atlas Woodworks',
		location: 'Bellingham, WA',
		period: 'January 2026 – Present',
		summary:
			'Restoration, custom interior and exterior millwork, and casework installation for a worker-owned shop in Whatcom County. Started part time while finishing my M.S. and moved to full time in June 2026.',
		bullets: [
			'Moving into material takeoffs for millwork projects: reading drawings, quantifying materials, and scoping jobs before they reach the floor',
			"Took over the shop's Squarespace site, handling content and structure updates"
		],
		stickers: 'bench'
	},
	{
		title: 'Graduate Researcher',
		company: 'Western Washington University — KIND Lab',
		location: 'Bellingham, WA',
		period: 'Winter 2025 – June 2026',
		summary:
			'Designed and ran a participatory user study with neurodivergent children and their families: literature review, survey instruments, assessment methodology, and data collection plans.',
		bullets: [
			'Conducted an in-home participatory evaluation with four neurodivergent children and their families, following the Co-Design Beyond Words methodology, with semi-structured caregiver interviews, child-facing visual surveys, and sessions averaging 85 minutes',
			"Applied Braun and Clarke's inductive thematic coding to caregiver interview transcripts across three coding rounds; separately coded video recordings for emotional engagement cues",
			'Mentored an undergraduate researcher in amending the IRB protocol to add an in-home co-design pilot, and re-sequenced the study to absorb a quarter-long recruiting delay'
		]
	},
	{
		title: 'Support Analyst L4',
		company: 'Körber Supply Chain (now Infios)',
		location: 'Bellingham, WA',
		period: '2020 – 2023',
		summary:
			'Primary technical point of contact for four enterprise warehouse-management accounts, double the team average of two.',
		bullets: [
			"Isolated faults across system boundaries, using WMS data to establish whether an issue originated in the warehouse system, the customer's order management system, Dynamics 365, or their network, and escalated to the responsible team with the evidence behind it",
			'Translated stakeholder requests into custom SQL reporting and web-based deliverables, achieving 46% more stable releases than the department average, and resolved deadlocks on high-traffic production systems',
			'Served as on-site technical lead at two system go-lives, and co-led a 30/60/90 onboarding framework that cut new-hire ramp time by 50%'
		],
		showSimulator: true
	},
	{
		title: 'Graduate Teaching Assistant',
		company: 'Western Washington University',
		location: 'Bellingham, WA',
		period: '2024 – 2025',
		summary:
			'Supported 30+ students per quarter across DATA 311 (Fundamentals of Data Science), CSCI 102 (Computer Mediated Communications), and CSCI 345 (Object-Oriented Design).',
		bullets: []
	},
	{
		title: 'Bartender',
		company: 'Redlight',
		location: 'Bellingham, WA',
		period: '2023 – 2025',
		summary: 'Made cocktails in a fast-paced downtown bar to finance graduate school.',
		bullets: [],
		stickers: 'bar'
	},
	{
		title: 'Bartender',
		company: 'Aslan Brewing Company',
		location: 'Bellingham, WA',
		period: 'March 2018 – March 2020',
		summary: 'Bartended through my undergraduate degree.',
		bullets: []
	},
	{
		title: 'Carpenter',
		company: 'Bespoke Construction',
		location: 'Bellingham, WA',
		period: '2015 – 2017',
		summary: 'Custom residential construction and finish carpentry.',
		bullets: [],
		stickers: 'saw'
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
		label: 'Support & Process',
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

// Icons are devicon SVGs (MIT) served from static/icons. Neither devicon nor Simple
// Icons ships Power BI or Tableau marks — both are trademark-restricted — so those
// two leave `icon` unset and render a neutral chart glyph instead of a wrong logo.
export const tools: Tool[] = [
	{ name: 'T-SQL', icon: 'microsoftsqlserver' },
	{ name: 'Python', icon: 'python' },
	{ name: 'C#', icon: 'csharp' },
	{ name: 'Java', icon: 'java' },
	{ name: 'JavaScript', icon: 'javascript' },
	{ name: 'Power BI' },
	{ name: 'Tableau' },
	{ name: 'MySQL', icon: 'mysql' },
	{ name: 'Git', icon: 'git' },
	{ name: 'Unity', icon: 'unity', mono: true },
	{ name: 'Svelte', icon: 'svelte' },
	{ name: 'Tailwind', icon: 'tailwindcss' }
];

export const publications: Publication[] = [
	{
		authors: 'Yasmine N. Elglaly, Ryan Critchlow, Katherine Baker, and Kristen Shinohara',
		title:
			'Ableism Unchecked: A Literature Review of Disability Misconceptions in Computing Education',
		venue:
			'To appear in Proceedings of the 28th International ACM SIGACCESS Conference on Computers and Accessibility (ASSETS 2026), Porto, Portugal, October 2026',
		status: 'published',
		summary:
			"The paper examines how accessibility coursework can produce measurable knowledge gains in students while their reflections still contain ableist framings, including deficit-based language, unsubstantiated claims about assistive technology, and erasure of disabled people's agency.",
		contribution:
			'Applied an iteratively developed codebook via inductive coding to all 35 papers in the review corpus and helped identify six recurring patterns of ableism. Findings were reviewed by a second researcher for consistency. This is my first conference presentation.'
	},
	{
		authors: 'Ryan Critchlow, Yasmine N. Elglaly, Clare Gaskill, and Tyanin Opdahl',
		title:
			'You and I: A Participatory Evaluation Study of a Serious Game to Practice Pronouns for Autistic Children',
		venue:
			'Targeting the 26th Annual ACM Interaction Design and Children Conference (IDC 2027), Seattle, WA, June 2027. In preparation',
		status: 'in-preparation',
		contribution:
			'First author. I planned the build, ran recruitment, designed the instruments, ran the in-home sessions, and coded the analysis. Findings are held until publication.'
	},
	{
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
	{ label: 'Publications', href: '/#publications' },
	{ label: 'Skills', href: '/#skills' },
	{ label: 'Education', href: '/#education' }
];
