export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  period: string;
  bullets: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
}

export interface CandidateCV {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  summary: string;
  skills: {
    languages: string[];
    frameworks: string[];
    databases: string[];
    cloudAndDevOps: string[];
    practices: string[];
  };
  experiences: WorkExperience[];
  education: Education[];
  certifications: string[];
}

export const INITIAL_CV: CandidateCV = {
  fullName: 'Alex Morgan',
  headline: 'Senior Full Stack Software Engineer | React, TypeScript, Node.js & Cloud Architecture',
  email: 'alex.morgan.dev@example.com',
  phone: '+1 (415) 890-1234',
  location: 'San Francisco, CA (Open to Remote)',
  linkedinUrl: 'https://linkedin.com/in/alexmorgan-dev',
  githubUrl: 'https://github.com/alexmorgan-dev',
  portfolioUrl: 'https://alexmorgan.dev',
  summary: 'Senior Full Stack Software Engineer with 6+ years of experience engineering high-performance web applications, distributed backend microservices, and modern user experiences. Track record of scaling systems to 1M+ active users, decreasing page latency by 45%, and architecting robust CI/CD and cloud pipelines.',
  skills: {
    languages: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'Go', 'HTML5', 'CSS3'],
    frameworks: ['React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'Redux Toolkit', 'GraphQL'],
    databases: ['PostgreSQL', 'Redis', 'MongoDB', 'DynamoDB'],
    cloudAndDevOps: ['AWS (ECS, Lambda, S3, RDS)', 'Docker', 'Kubernetes', 'CI/CD (GitHub Actions)', 'Terraform'],
    practices: ['System Design', 'Microservices', 'REST API Design', 'Unit Testing (Jest, Playwright)', 'Agile / Scrum']
  },
  experiences: [
    {
      id: 'exp-1',
      title: 'Senior Software Engineer',
      company: 'TechFlow Systems',
      location: 'San Francisco, CA (Hybrid)',
      period: '2023 - Present',
      bullets: [
        'Architected high-throughput microservices using TypeScript, Node.js, and Redis, sustaining 500,000+ daily requests with 99.98% uptime.',
        'Engineered responsive React 19 frontend interfaces with Tailwind CSS and Next.js, reducing Core Web Vitals LCP by 42%.',
        'Spearheaded automated CI/CD deployment pipelines on AWS using GitHub Actions and Docker, reducing production deployment duration by 60%.'
      ]
    },
    {
      id: 'exp-2',
      title: 'Full Stack Software Engineer',
      company: 'Nexus Digital',
      location: 'San Jose, CA',
      period: '2021 - 2023',
      bullets: [
        'Developed end-to-end web features for an enterprise B2B SaaS platform serving 250+ enterprise clients using React and Node.js.',
        'Optimized PostgreSQL query execution plans and database indexes, accelerating analytics report generation by 38%.',
        'Collaborated with product designers to implement an accessible component design system adopted by 14 cross-functional engineers.'
      ]
    },
    {
      id: 'exp-3',
      title: 'Software Engineer',
      company: 'Orbit Labs',
      location: 'Remote',
      period: '2019 - 2021',
      bullets: [
        'Engineered RESTful APIs and webhook integration pipelines supporting 50M+ monthly events.',
        'Implemented comprehensive automated test coverage with Jest and Cypress, elevating test coverage from 55% to 88%.',
        'Collaborated on cloud infrastructure modernization migrating legacy monolith services to containerized Docker environments.'
      ]
    }
  ],
  education: [
    {
      degree: 'B.S. in Computer Science',
      institution: 'University of California, Berkeley',
      year: '2019',
      gpa: '3.82'
    }
  ],
  certifications: [
    'AWS Certified Solutions Architect – Associate (2025)',
    'Certified Kubernetes Application Developer (CKAD)'
  ]
};

export function cvToPlainText(cv: CandidateCV): string {
  let text = `${cv.fullName}\n${cv.headline}\n${cv.email} | ${cv.phone} | ${cv.location}\nLinkedIn: ${cv.linkedinUrl} | GitHub: ${cv.githubUrl}\n\n`;
  text += `PROFESSIONAL SUMMARY\n${cv.summary}\n\n`;
  text += `TECHNICAL SKILLS\n`;
  text += `• Languages: ${cv.skills.languages.join(', ')}\n`;
  text += `• Frameworks & Libraries: ${cv.skills.frameworks.join(', ')}\n`;
  text += `• Databases: ${cv.skills.databases.join(', ')}\n`;
  text += `• Cloud & DevOps: ${cv.skills.cloudAndDevOps.join(', ')}\n`;
  text += `• Methodologies: ${cv.skills.practices.join(', ')}\n\n`;

  text += `WORK EXPERIENCE\n`;
  for (const exp of cv.experiences) {
    text += `${exp.title} | ${exp.company} (${exp.location}) - ${exp.period}\n`;
    for (const b of exp.bullets) {
      text += `• ${b}\n`;
    }
    text += '\n';
  }

  text += `EDUCATION\n`;
  for (const edu of cv.education) {
    text += `${edu.degree} - ${edu.institution} (${edu.year})\n`;
  }

  if (cv.certifications.length > 0) {
    text += `\nCERTIFICATIONS\n`;
    for (const cert of cv.certifications) {
      text += `• ${cert}\n`;
    }
  }

  return text;
}
