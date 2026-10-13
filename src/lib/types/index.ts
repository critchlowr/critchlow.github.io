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
	/** A small hand-drawn scene along the bottom of the card. */
	scene?: 'bar' | 'saw' | 'bench';
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
}

export interface Tool {
	name: string;
	/** File name in static/icons, without extension. Unset renders a generic chart glyph. */
	icon?: string;
	/** Single-colour dark mark that needs inverting to stay visible in dark mode. */
	mono?: boolean;
}

export interface Stat {
	value: string;
	label: string;
}
