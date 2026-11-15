export interface Experience {
	title: string;
	company: string;
	location: string;
	period: string;
	bullets: string[];
	summary?: string;
	/** Shows the link to the WMS simulator and the conveyor belt under this role. */
	showSimulator?: boolean;
	/** Anchor id for the role, so the Skills section can link to it. */
	id?: string;
	/** Hand-drawn objects shown under the role's dates. */
	stickers?: 'bar' | 'saw' | 'bench' | 'research' | 'warehouse';
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
	status: 'published' | 'under-review';
	/** An award or nomination, shown under the venue. */
	honor?: string;
	/** Funding acknowledgment, worded as in the paper. */
	funding?: string;
	summary?: string;
	contribution: string;
	href?: string;
	hrefLabel?: string;
	/** Opens in a new tab. */
	external?: boolean;
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
