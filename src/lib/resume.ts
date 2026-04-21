export type ResumeData = {
  profile: string;
  experiences: Array<{
    title: string;
    company: string;
    years: { start: number; end: number | "Present" };
    description: string | Array<string>;
    address?: string;
  }>;
  skills: Array<{
    category: string;
    name: string;
    isExpert: string;
  }>;
  education: {
    universityName: string;
    progression: string;
    degreeName: string;
    gpa?: string;
  } | null;
};

export const resumeData: ResumeData = {
  profile:
    "Full-stack developer with 7 years experience specializing in TypeScript, C#, and the React ecosystem (Next.js, TanStack Router). Programming is both my profession and my hobby. I’m continuously exploring new technologies beyond work hours. Outside of development, I enjoy automotive projects, traveling, and discovering new restaurants with friends.",
  experiences: [
    {
      title: "Intermediate Software Developer",
      company: "Know History Inc.",
      years: { start: 2022, end: "Present" },
      description: [
        `Led technical infrastructure decisions and architected cloud-based solutions for multiple client projects Implemented CI/CD pipelines for production systems after senior developer departure, ensuring continuous deployment capabilities`,
        `Mentored junior developers and conducted in-depth code reviews, improving team code quality and development practices`,
        `Drove technology adoption and cost optimization by evaluating and implementing modern front-end frameworks and UI libraries`,
        `Served as technical lead for client demos and project estimates, representing development team in stakeholder meetings`,
        `Architected and maintained core internal systems and cross-project infrastructure components`,
      ],
      address: "Calgary, AB",
    },
    {
      title: "Junior Software Developer",
      company: "DevFacto",
      years: { start: 2020, end: 2022 },
      description: [
        `Developed core mobile app features for myASEBP including enhanced search functionality, benefit management interfaces, and accessibility improvements`,
        `Built internal automation tools that streamlined workflows and reduced manual processing time for development and operations teams`,
        `Collaborated on cross-functional teams to deliver mobile application updates and maintain high code quality standards`,
      ],
      address: "Edmonton, AB",
    },
    {
      title: "Software Engineer Intern",
      company: "Intuit",
      years: { start: 2019, end: 2019 },
      description: [
        `Contributed to QuickBooks Online as full-stack developer, implementing major workflow features used by millions of small business customers`,
        `Designed and developed reusable UI components for Intuit Design System, creating data table functionality deployed across all major Intuit products`,
        `Established comprehensive testing practices by implementing extensive unit test suites, significantly improving code coverage and system reliability`,
        `Worked in agile development environment collaborating with senior engineers on large-scale fintech applications`,
      ],
      address: "Edmonton, AB",
    },
    {
      title: "Software Engineer Intern",
      company: "DevFacto",
      years: { start: 2018, end: 2018 },
      description: [
        `Developed cross-platform mobile application using React Native for iOS and Android, delivering native performance across multiple device form factors`,
        `Engineered custom master-detail navigation component from scratch before industry-standard libraries existed, demonstrating problem-solving and innovation`,
        `Optimized application for tablet devices including iPad- specific UI/UX considerations and responsive design patterns`,
        `Helped implement automated build pipelines using Microsoft App Center for continuous integration and deployment across mobile platforms`,
      ],
      address: "Edmonton, AB",
    },
  ],
  skills: [
    { category: "Languages", name: "TypeScript", isExpert: "yes" },
    { category: "Languages", name: "Rust", isExpert: "no" },
    { category: "Languages", name: "Go", isExpert: "no" },
    { category: "Languages", name: "Swift", isExpert: "no" },
    { category: "Languages", name: "C#", isExpert: "yes" },
    { category: "Languages", name: "Java", isExpert: "yes" },
    { category: "Frameworks", name: "React", isExpert: "yes" },
    { category: "Frameworks", name: "Next.js", isExpert: "yes" },
    { category: "Frameworks", name: "Tailwind", isExpert: "yes" },
    { category: "Frameworks", name: "Angular", isExpert: "no" },
    { category: "Frameworks", name: "Vue", isExpert: "no" },
    { category: "Frameworks", name: "React Native", isExpert: "no" },
    { category: "Frameworks", name: "Convex", isExpert: "yes" },
    { category: "Frameworks", name: "Tauri", isExpert: "no" },
    { category: "Frameworks", name: "ElectronJS", isExpert: "no" },
    { category: "Frameworks", name: "Clerk", isExpert: "no" },
    { category: "Frameworks", name: "Stripe", isExpert: "no" },
    { category: "Frameworks", name: "Plaid", isExpert: "no" },
    { category: "Frameworks", name: "GraphQL", isExpert: "no" },
    { category: "Frameworks", name: "Spring Boot", isExpert: "no" },
    { category: "Frameworks", name: "Storybook", isExpert: "yes" },
    { category: "Databases", name: "PostgreSQL", isExpert: "yes" },
    { category: "Databases", name: "MongoDB", isExpert: "no" },
    { category: "Databases", name: "MSSQL", isExpert: "yes" },
    { category: "Tools", name: "Nix", isExpert: "yes" },
    { category: "Tools", name: "Docker", isExpert: "yes" },
    { category: "Tools", name: "Bun", isExpert: "yes" },
    { category: "Tools", name: "pnpm", isExpert: "yes" },
    { category: "Tools", name: "Yarn", isExpert: "no" },
    { category: "Tools", name: "Git", isExpert: "yes" },
    { category: "Tools", name: "Linux", isExpert: "yes" },
    { category: "Tools", name: "Node.js", isExpert: "yes" },
    { category: "Tools", name: "CSS", isExpert: "yes" },
    { category: "Tools", name: "CSS-in-JS", isExpert: "no" },
    { category: "Tools", name: "AWS", isExpert: "no" },
    { category: "Tools", name: "Azure", isExpert: "yes" },
    { category: "Tools", name: "GitHub Runners", isExpert: "yes" },
    { category: "Tools", name: "Self Hosting", isExpert: "yes" },
  ],
  education: null,
};
