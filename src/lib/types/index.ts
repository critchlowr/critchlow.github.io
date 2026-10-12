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
	/** Shows the bartending photo marquee on this card. */
	showBartendingPhotos?: boolean;
}

export interface Education {
	school: string;
	degree: string;
	location: string;
	period: string;
	notes?: string[];
}

export interface Project {
	title: string;
	description: string;
	tools: string;
	period: string;
	bullets: string[];
	href?: string;
	hrefLabel?: string;
	/** Launches the WMS simulator modal instead of navigating. */
	action?: 'simulator';
	/** Opens in a new tab and gets an external-link affordance. */
	external?: boolean;
}

export interface Publication {
	/** Anchor for the Research card, so other sections can link straight to it. */
	id: string;
	authors: string;
	title: string;
	venue: string;
	status: 'published' | 'in-preparation';
	/** An award or nomination, shown on the featured card and the Research card. */
	honor?: string;
	/** Funding acknowledgment, as stated in the paper. */
	funding?: string;
	summary?: string;
	contribution: string;
	href?: string;
	hrefLabel?: string;
	/** Opens in a new tab and gets an external-link affordance. */
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
}
