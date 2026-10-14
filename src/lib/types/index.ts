export interface Experience {
	title: string;
	company: string;
	location: string;
	period: string;
	bullets: string[];
	summary?: string;
	tags?: string[];
	href?: string;
	hrefLabel?: string;
	/** Shows the "Try the WMS Simulator" button and the conveyor belt on this card. */
	showSimulator?: boolean;
	/** Anchor id for the card, so the Skills section can link to it. */
	id?: string;
	/** Hand-drawn stickers around the card's edges. */
	stickers?: 'bar' | 'saw' | 'bench';
}

export interface Education {
	school: string;
	degree: string;
	location: string;
	period: string;
	notes?: string[];
}

export interface Publication {
	authors: string;
	title: string;
	venue: string;
	status: 'published' | 'in-preparation';
	summary?: string;
	contribution: string;
	href?: string;
	hrefLabel?: string;
}

export interface ContactLink {
	label: string;
	href: string;
	icon: 'email' | 'phone' | 'linkedin' | 'github' | 'resume';
	display: string;
}

export interface SkillCategory {
	label: string;
	items: string[];
	/** Where these skills were used: links to the role or section that shows them. */
	from: { label: string; href: string }[];
}

export interface Stat {
	value: string;
	label: string;
}
