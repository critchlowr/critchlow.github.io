import type {
  Experience,
  Education,
  Project,
  ContactLink,
  SkillCategory,
} from "$lib/types";

export const hero = {
  name: "Ryan Critchlow",
  tagline: "MS Computer Science (HCI) · Researcher · Builder",
  summary:
    "Graduate student at Western Washington University specializing in Human-Computer Interaction. Three years of enterprise database management and SQL optimization experience. Research focused on accessible educational technology for children with autism.",
};

export const about = {
  heading: "About Me",
  paragraphs: [
    "I'm a Computer Science graduate student at Western Washington University with a focus on Human-Computer Interaction. My research centers on building accessible educational technology — specifically, designing games that help children with autism practice language skills.",
    "Before grad school, I spent three years as a support analyst and SQL developer, where I got deep into database optimization, stakeholder collaboration, and shipping stable software releases. I've also bartended, built things with my hands as a carpenter, and taught courses ranging from data science to object-oriented design.",
    "I'm driven by the intersection of technical problem-solving and human-centered design — building things that are not just functional, but genuinely usable and inclusive.",
  ],
};

export const experience: Experience[] = [
  {
    title: "Research Assistant",
    company: "Western Washington University — KIND Lab",
    location: "Bellingham, WA",
    period: "September 2025 – Present",
    bullets: [
      "Designed and developed the KIND Lab website to showcase research initiatives and improve lab visibility",
      "Independently edit and revise research papers for clarity, structure, and adherence to publication standards",
    ],
  },
  {
    title: "Graduate Teaching Assistant",
    company: "Western Washington University",
    location: "Bellingham, WA",
    period: "2024 – 2025",
    bullets: [
      "Supported 30+ students per quarter across three courses: DATA 311 (Fundamentals of Data Science), CSCI 102 (Computer Mediated Communications), and CSCI 345 (Object-Oriented Design)",
      "Provided weekly feedback on assignments and hosted regular office hours for student support",
      "Utilized Python for data science instruction, HTML5 and CSS for web technologies, and UML for object-oriented design principles",
    ],
  },
  {
    title: "Support Analyst L4",
    company: "Körber Supply Chain",
    location: "Bellingham, WA",
    period: "2020 – 2023",
    bullets: [
      "Performance tuned, optimized, and automated SQL tasks via SSMS, utilizing advanced techniques including CTEs, stored procedures, profiling, indexing, SQL Server Agents, and error handling",
      "Worked directly with stakeholders to implement custom SQL reporting and webpages, delivering 46% more stable releases than support averages",
      "Collaborated with a team of 6 to develop a new 30/60/90 training model, decreasing onboarding times by 50%",
    ],
  },
  {
    title: "Bartender",
    company: "Redlight",
    location: "Bellingham, WA",
    period: "Previous",
    bullets: [
      "Crafted cocktails and provided hospitality in a fast-paced downtown environment while financing graduate school",
    ],
  },
  {
    title: "Bartender",
    company: "Aslan Brewing Company",
    location: "Bellingham, WA",
    period: "Previous",
    bullets: [
      "Delivered excellent customer service in a high-volume craft brewery setting",
    ],
  },
  {
    title: "Carpenter",
    company: "Bespoke Construction",
    location: "Bellingham, WA",
    period: "Previous",
    bullets: [
      "Performed custom residential construction and finish carpentry work",
    ],
  },
];

export const education: Education[] = [
  {
    school: "Western Washington University",
    degree: "Master of Science in Computer Science",
    location: "Bellingham, WA",
    period: "Expected March 2026",
    notes: ["Research in Human-Computer Interaction under Dr. Elglaly"],
  },
  {
    school: "Western Washington University",
    degree: "Bachelor of Arts in Management of Information Systems",
    location: "Bellingham, WA",
    period: "Completed",
  },
];

export const skills: SkillCategory[] = [
  {
    label: "Programming Languages",
    items: [
      "Java",
      "Python",
      "C#",
      "C",
      "T-SQL",
      "PL/SQL",
      "HTML",
      "CSS",
      "JavaScript",
    ],
  },
  {
    label: "Technologies & Tools",
    items: [
      "Git",
      "SSMS",
      "MySQL",
      "Power BI",
      "Tableau",
      "Unity",
      "SvelteKit",
    ],
  },
  {
    label: "Specialized Knowledge",
    items: [
      "WCAG 2.1 Accessibility Standards",
      "Human-Computer Interaction Design",
      "Database Optimization & Performance Tuning",
    ],
  },
];

export const projects: Project[] = [
  {
    title: "Accessible Web Game for Pronoun Learning",
    description:
      "A touchscreen-based educational game designed to help children with autism practice pronouns through interactive play.",
    tools: "Unity, C#",
    period: "2025 – 2026",
    bullets: [
      "Designed and developed a touchscreen-based educational game to help children with autism practice pronouns",
      "Conducted user testing with neurodiverse children to inform iterative design for future versions",
    ],
  },
  {
    title: "Increasing Alt Text Authorship",
    description:
      "Collaborative research paper focused on improving the creation and quality of alt text for web accessibility.",
    tools: "Research, HCI",
    period: "In Review",
    bullets: [
      "Co-authored research paper currently in review focused on increasing alt text authorship for web accessibility",
    ],
  },
  {
    title: "KIND Lab Website",
    description:
      "Designed and built the website for the KIND Lab at WWU to showcase research initiatives and improve lab visibility.",
    tools: "Web Development",
    period: "2025",
    bullets: [
      "Designed and developed a research lab website to showcase initiatives and improve visibility",
    ],
  },
];

export const contact: ContactLink[] = [
  {
    label: "Email",
    href: "mailto:critchlow.rc@gmail.com",
    icon: "email",
    display: "critchlow.rc@gmail.com",
  },
  {
    label: "Phone",
    href: "tel:+13609416785",
    icon: "phone",
    display: "(360) 941-6785",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/ryan-critchlow",
    icon: "linkedin",
    display: "ryan-critchlow",
  },
  {
    label: "GitHub",
    href: "https://github.com/critchlowr",
    icon: "github",
    display: "critchlowr",
  },
];

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Education", href: "#education" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];
