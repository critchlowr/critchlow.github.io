import type { Experience, Education, Publication, ContactLink, SkillCategory } from '$lib/types';

export const hero = {
	name: 'Ryan Critchlow',
	tagline: 'UX researcher focused on accessibility',
	summary:
		'I plan and run research with the people a technology is for, using participatory design, semi-structured interviews, and thematic analysis. I co-authored a peer-reviewed paper at ASSETS 2026 and hold an M.S. in Computer Science. Before graduate school, I spent three years as an L4 support analyst on enterprise warehouse-management accounts at Körber.',
	status: 'At ASSETS 2026 in Vila Nova de Gaia, Portugal, October 25–28.',
	availability:
		'Open to UX research, accessibility engineer, and technical support engineer roles in the Pacific Northwest or remote.',
	resumeHref: '/Ryans_Resume_2026.pdf'
};

export const about = {
	paragraphs: [
		"I've been building things for people my whole life, technical or otherwise. My father is a carpenter, so I grew up on job sites learning to build things that last and that suit the style and age of the homes they go into. I carried the troubleshooting I learned there into my work at Körber Supply Chain, where I administered warehouse management systems as a technical support analyst, bridging implementation consulting and SQL development. I wanted to build the systems, not just support them, so I went back to Western for an M.S. in Computer Science. I've been a bartender and a carpenter along the way, and I'm working as a journeyman carpenter now.",
		"My graduate work in the KIND Lab gave me experience designing ethical research studies with human participants. I led the project and used Claude to rapidly prototype a Unity-based learning tool to help neurodivergent children practice and learn language skills. I made the game's art myself. I scoped an IRB-approved study, designing the survey instruments, the analysis methods, and the game itself based on practitioner feedback. Before launching that study, I shifted to a pilot study with four families to refine the game's design with the children who would use it. The language assessment is left to a future team.",
		"When I'm not working, you'll find me on a trail with Georgia, my chocolate lab, training for my next half marathon, or behind a bar making cocktails. I'm into road biking, reading, and the occasional long video game session. I like being outside as much as I can."
	]
};

// Each role is one summary line plus at most three bullets. The full detail lives in
// the résumé PDF, which is one click away from every section.
export const experience: Experience[] = [
	{
		title: 'Journeyman Carpenter',
		id: 'atlas',
		company: 'Atlas Woodworks',
		location: 'Bellingham, WA',
		period: 'January 2026 – Present',
		summary:
			'Restoration, custom interior and exterior millwork, and casework installation for a worker-owned shop in Whatcom County. Started part time while finishing my M.S. and moved to full time in June 2026.',
		bullets: [
			'Work independently in the field, making design decisions on site to fit 100-year-old homes and combining traditional building practices with modern ones, especially for waterproofing',
			'Moving into material takeoffs for millwork that the shop designs and then installs in the field: reading drawings, quantifying materials, and scoping jobs',
			"Took over the shop's Squarespace site, handling content and structure updates"
		],
		stickers: 'bench'
	},
	{
		title: 'Graduate Researcher',
		id: 'kind-lab',
		company: 'Western Washington University — KIND Lab',
		location: 'Bellingham, WA',
		period: 'Winter 2025 – June 2026',
		summary:
			'Designed and ran a participatory user study with neurodivergent children and their families: literature review, survey instruments, assessment methodology, and data collection plans.',
		bullets: [
			'Conducted an in-home participatory evaluation with neurodivergent children and their families, using semi-structured caregiver interviews and child-facing visual surveys',
			"Applied Braun and Clarke's inductive thematic coding to caregiver interview transcripts across three coding rounds; separately coded video recordings for emotional engagement cues",
			'Mentored an undergraduate researcher in amending the IRB protocol to add an in-home co-design pilot, and re-sequenced the study to absorb a quarter-long recruiting delay'
		]
	},
	{
		title: 'Support Analyst L4',
		id: 'korber',
		company: 'Körber Supply Chain (now Infios)',
		location: 'Bellingham, WA',
		period: '2020 – 2023',
		summary:
			'Primary technical point of contact for four enterprise warehouse-management accounts, double the team average of two.',
		bullets: [
			"Isolated faults across system boundaries, using WMS data to establish whether an issue originated in the warehouse system, the customer's order management system, Dynamics 365, or their network; resolved issues directly and escalated those that needed cloud or database administration expertise to the responsible team, with the evidence behind them",
			'Translated stakeholder requests into bug fixes, platform and web page enhancements, and custom SQL reporting, with 46% more stable releases than the department average; resolved deadlocks on high-traffic production systems',
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
		summary:
			'Crafted high-end cocktails in a downtown bar, working 30+ hours a week to pay my way through graduate school.',
		bullets: [
			'Part of the core team that grew Redlight into a high-volume venue and moved it to a larger location, as Friday sales went from $3,500 to $11,000'
		],
		stickers: 'bar'
	},
	{
		title: 'Bartender',
		company: 'Aslan Brewing Company',
		location: 'Bellingham, WA',
		period: 'March 2018 – March 2020',
		summary:
			'Worked through my undergraduate degree, starting as support staff and moving up to serving and bartending.',
		bullets: [
			'Helped the brewery through one of its busiest summers up to that point',
			'Received a staff award for hard work and dedication, one of the few given to support staff'
		]
	},
	{
		title: 'Carpenter',
		company: 'Bespoke Construction',
		location: 'Bellingham, WA',
		period: '2015 – 2017',
		summary: 'Custom residential construction and finish carpentry.',
		bullets: [
			'Led a three-person crew across seven projects, assigning tasks by skill level to keep job sites running efficiently'
		],
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
	// ORCID licenses its iD icon for this use, so it is served from static/. ACM's
	// logo is a restricted trademark, so Publications.svelte sets that chip in type.
	membershipDetail: 'Association for Computing Machinery, 2026–present'
};

// Each group says where it was used, so the list reads as evidence, not keywords.
export const skills: SkillCategory[] = [
	{
		label: 'Research methods',
		items: [
			'Participatory evaluation',
			'Semi-structured interviews',
			'Thematic analysis (Braun & Clarke)',
			'Survey & instrument design',
			'Video coding',
			'Systematic literature coding',
			'IRB protocols',
			'WCAG 2.2'
		],
		from: [
			{ label: 'KIND Lab', href: '#kind-lab' },
			{ label: 'ASSETS 2026', href: '#publications' }
		]
	},
	{
		label: 'Troubleshooting & support',
		items: [
			'Fault isolation across systems',
			'Escalation with evidence',
			'SQL performance tuning',
			'Deadlock resolution',
			'Go-live support',
			'Knowledge base writing',
			'Onboarding & training'
		],
		from: [{ label: 'Körber', href: '#korber' }]
	},
	{
		label: 'Process & stakeholders',
		items: [
			'Requirements gathering',
			'Stakeholder management',
			'Scope & change control',
			'Prioritization & tradeoffs',
			'Material takeoffs & scoping'
		],
		from: [
			{ label: 'Körber', href: '#korber' },
			{ label: 'Atlas Woodworks', href: '#atlas' }
		]
	},
	{
		label: 'Data & tools',
		items: [
			'T-SQL',
			'MySQL',
			'Python',
			'Power BI',
			'Tableau',
			'C#',
			'Java',
			'JavaScript',
			'Unity',
			'Svelte',
			'Git'
		],
		from: [
			{ label: 'Körber', href: '#korber' },
			{ label: 'KIND Lab', href: '#kind-lab' },
			{ label: 'M.S.', href: '#education' }
		]
	}
];

export const publications: Publication[] = [
	{
		authors: 'Yasmine N. Elglaly, Ryan Critchlow, Kristen Shinohara, and Catherine M. Baker',
		title:
			'Ableism Unchecked: A Literature Review of Disability Misconceptions in Computing Education',
		venue:
			'To appear in Proceedings of the 28th International ACM SIGACCESS Conference on Computers and Accessibility (ASSETS 2026), Vila Nova de Gaia, Portugal, October 2026',
		status: 'published',
		honor: 'Nominated for the Social Impact Award',
		funding:
			'Supported by the National Science Foundation under Award Nos. 2121549, 2121606, 2121428, 2439816, 2439817, and 2439818.',
		summary:
			"Little work has examined how accessibility education affects students' assumptions about disability, or the ableist framings that can coexist with reported empathy and knowledge gains. In the first of two studies, many of 53 students' reflections from a Computer Systems course activity on assistive technology showed knowledge gains and critical engagement, but a considerable portion also contained unsubstantiated claims about assistive technology, deficit-based language, and erasure of disabled people's agency. The second, a review of 35 accessibility education papers reporting attitudinal outcomes, identified six ableist categories, such as exclusion of disabled participants and normalization of inaccessibility, in intervention designs, evaluation instruments, study framing, and reported student data. The paper recommends explicitly teaching disability bias, designing evaluation instruments that detect disability misconceptions, and adopting disability-centric, reflexive research practices.",
		contribution:
			'Coded all 35 papers in the review corpus against a codebook the research team had developed iteratively, and helped identify six recurring patterns of ableism. A second researcher reviewed a subset for consistency. This is my first conference presentation.'
	},
	{
		authors: 'Anonymous authors',
		title:
			'A Participatory Evaluation Study of Language Learning Tools with Neurodivergent Children',
		venue: 'In preparation for a 2027 ACM conference',
		status: 'in-preparation',
		contribution:
			'First author. I planned the build, ran recruitment, designed the instruments, ran the in-home sessions, and coded the analysis. Findings are held until publication.'
	},
	{
		authors: 'Anonymous authors',
		title: 'A Study of Motivation in Alt Text Authoring',
		venue: 'In preparation for a 2027 ACM conference',
		status: 'in-preparation',
		contribution:
			'I joined after the original authors had graduated. I revised the discussion section and worked with the faculty advisor to bring the manuscript to submission readiness.'
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
	{ label: 'Education', href: '/#education' },
	{ label: 'Publications', href: '/#publications' },
	{ label: 'Experience', href: '/#experience' },
	{ label: 'Skills', href: '/#skills' }
];
