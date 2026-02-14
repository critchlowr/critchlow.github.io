export interface Experience {
	title: string;
	company: string;
	location: string;
	period: string;
	bullets: string[];
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
}

export interface ContactLink {
	label: string;
	href: string;
	icon: 'email' | 'phone' | 'linkedin' | 'github';
	display: string;
}

export interface SkillCategory {
	label: string;
	items: string[];
}
