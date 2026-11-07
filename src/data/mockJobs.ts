import { JobPosting } from '../utils/autoApplyEngine';

export const INITIAL_JOBS: JobPosting[] = [
  {
    id: 'job-1',
    title: 'Senior Full Stack Engineer (React, TypeScript & Node)',
    company: 'Stripe',
    location: 'San Francisco, CA (Hybrid / Remote Option)',
    workMode: 'Hybrid',
    salaryRange: '$170,000 - $210,000 + Equity',
    postedDate: '2 hours ago',
    easyApply: true,
    source: 'LinkedIn',
    requiredSkills: ['typescript', 'react', 'node.js', 'postgresql', 'aws', 'system design', 'rest api', 'microservices'],
    description: `Stripe is looking for a Senior Full Stack Engineer to join our Global Payments Experience team. You will lead the design and implementation of highly available web experiences and backend microservices that process billions of dollars in global transactions.

Responsibilities:
• Architect, build, and maintain performant user-facing applications using React, TypeScript, and modern state management.
• Design robust, scalable backend services in Node.js and Go backed by PostgreSQL and distributed caching layers.
• Collaborate with cross-functional product designers, data scientists, and infrastructure engineers to optimize checkout conversion by up to 25%.
• Champion software engineering excellence, automated CI/CD pipelines, and rigorous unit testing.

Requirements:
• 5+ years of software engineering experience with modern TypeScript and React.
• Deep understanding of distributed systems, relational databases (PostgreSQL), and cloud infrastructure (AWS or GCP).
• Track record of taking complex user workflows and decomposing them into intuitive, accessible web interfaces.`,
    screeningQuestions: [
      { id: 'q1', question: 'How many years of work experience do you have with TypeScript?', type: 'number' },
      { id: 'q2', question: 'How many years of work experience do you have with React?', type: 'number' },
      { id: 'q3', question: 'Will you now or in the future require employment visa sponsorship?', type: 'boolean' },
      { id: 'q4', question: 'Are you legally authorized to work in the United States?', type: 'boolean' },
      { id: 'q5', question: 'What is your desired base annual salary?', type: 'text' }
    ]
  },
  {
    id: 'job-2',
    title: 'Senior Frontend Engineer - Design Systems & Core App',
    company: 'Linear',
    location: 'Remote (US / Canada / Europe)',
    workMode: 'Remote',
    salaryRange: '$160,000 - $195,000 + Token/Equity',
    postedDate: '5 hours ago',
    easyApply: true,
    source: 'LinkedIn',
    requiredSkills: ['react', 'typescript', 'tailwind', 'performance optimization', 'graphql', 'unit testing'],
    description: `Linear creates the purpose-built issue tracker loved by high-velocity software teams worldwide. We are looking for a Senior Frontend Engineer who obsesses over sub-50ms interaction latencies, keyboard ergonomics, and pixel-perfection.

Key Responsibilities:
• Build rich, synchronous collaborative UI components in React and TypeScript.
• Optimize client-side caching, virtualized lists, and rendering performance to maintain fluid 60fps animations.
• Enhance our Tailwind CSS design system and accessibility tree.
• Write comprehensive end-to-end tests using Playwright and Jest.

Requirements:
• 4+ years dedicated to modern frontend engineering with React and TypeScript.
• Mastery of CSS layout math, browser rendering engines, and DOM performance optimization.
• High aesthetic bar and passion for developer tooling.`,
    screeningQuestions: [
      { id: 'q1', question: 'How many years of work experience do you have with React and Tailwind?', type: 'number' },
      { id: 'q2', question: 'Have you worked extensively in fully remote asynchronous teams?', type: 'boolean' },
      { id: 'q3', question: 'What notice period would you require prior to joining?', type: 'text' }
    ]
  },
  {
    id: 'job-3',
    title: 'Staff Cloud Platform & Microservices Engineer',
    company: 'Datadog',
    location: 'New York, NY (Hybrid)',
    workMode: 'Hybrid',
    salaryRange: '$185,000 - $225,000',
    postedDate: '1 day ago',
    easyApply: true,
    source: 'LinkedIn',
    requiredSkills: ['node.js', 'docker', 'kubernetes', 'aws', 'ci/cd', 'postgresql', 'redis', 'kafka'],
    description: `Datadog is looking for an experienced Platform Engineer to scale our telemetry processing pipeline. You will be responsible for orchestrating containerized microservices and automated deployment workflows handling terabytes of metrics per minute.

Requirements:
• 6+ years of experience with Node.js, Go, or Python in high-throughput cloud environments.
• Extensive production experience with Kubernetes, Docker, AWS, and distributed streaming (Kafka/Redis).
• Strong familiarity with automated CI/CD and infrastructure as code.`,
    screeningQuestions: [
      { id: 'q1', question: 'How many years of production experience do you have with Kubernetes and Docker?', type: 'number' },
      { id: 'q2', question: 'Are you comfortable working in a hybrid arrangement in New York or San Francisco?', type: 'boolean' },
      { id: 'q3', question: 'Are you legally authorized to work in the US?', type: 'boolean' }
    ]
  },
  {
    id: 'job-4',
    title: 'Full Stack Engineer - AI Developer Tools',
    company: 'Vercel',
    location: 'Remote',
    workMode: 'Remote',
    salaryRange: '$165,000 - $205,000',
    postedDate: '1 day ago',
    easyApply: true,
    source: 'LinkedIn',
    requiredSkills: ['next.js', 'react', 'typescript', 'node.js', 'tailwind', 'rest api', 'ai/ml'],
    description: `Join Vercel's AI Developer Experience team to build the future of next-generation web creation. You will work on SDKs, interactive developer sandboxes, and edge computing runtimes.

Responsibilities:
• Architect full stack features using Next.js, React Server Components, and TypeScript.
• Integrate LLM capabilities and streaming interfaces into production workflows.
• Optimize serverless cold starts and client-side bundle sizes.`,
    screeningQuestions: [
      { id: 'q1', question: 'How many years of experience do you have with Next.js and TypeScript?', type: 'number' },
      { id: 'q2', question: 'Will you now or in the future require visa sponsorship?', type: 'boolean' },
      { id: 'q3', question: 'What is your expected annual compensation?', type: 'text' }
    ]
  },
  {
    id: 'job-5',
    title: 'Senior Software Engineer - Data Infrastructure',
    company: 'Supabase',
    location: 'Remote',
    workMode: 'Remote',
    salaryRange: '$160,000 - $190,000 + Equity',
    postedDate: '2 days ago',
    easyApply: true,
    source: 'LinkedIn',
    requiredSkills: ['postgresql', 'typescript', 'node.js', 'docker', 'rest api', 'graphql'],
    description: `Supabase is the open source Firebase alternative. We are seeking a Senior Engineer to scale our PostgreSQL multi-tenant infrastructure and developer APIs.

What you will do:
• Build backend APIs and management services using TypeScript and Node.js.
• Enhance our Postgres replication and disaster recovery systems.
• Work in the open on open-source repositories and engage with global developer communities.`,
    screeningQuestions: [
      { id: 'q1', question: 'How many years of experience do you have with PostgreSQL?', type: 'number' },
      { id: 'q2', question: 'Have you contributed to open-source software repositories?', type: 'boolean' }
    ]
  },
  {
    id: 'job-6',
    title: 'Full Stack Web Engineer - Creator Platforms',
    company: 'Notion',
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    salaryRange: '$170,000 - $215,000',
    postedDate: '3 days ago',
    easyApply: true,
    source: 'LinkedIn',
    requiredSkills: ['react', 'typescript', 'node.js', 'system design', 'rest api', 'agile'],
    description: `Notion is blending notes, docs, project management, and AI into one modular workspace. Join our Ecosystem Engineering team to build third-party integrations and rich workspace extension capabilities.`,
    screeningQuestions: [
      { id: 'q1', question: 'How many years of experience do you have with React?', type: 'number' },
      { id: 'q2', question: 'Are you willing to work 2 days a week in our San Francisco office?', type: 'boolean' },
      { id: 'q3', question: 'What is your current notice period?', type: 'text' }
    ]
  }
];

export const INITIAL_APPLICATION_RECORDS = [
  {
    id: 'app-1',
    jobId: 'job-prev-1',
    jobTitle: 'Senior React Developer',
    company: 'Airbnb',
    location: 'Remote (US)',
    appliedDate: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    status: 'Interview' as const,
    atsScore: 94,
    tailoredResumeSummary: 'Senior React specialist emphasizing design system scalability and performance optimization.',
    notes: 'Technical recruiter screen scheduled for Tuesday 10am.'
  },
  {
    id: 'app-2',
    jobId: 'job-prev-2',
    jobTitle: 'Full Stack Engineer',
    company: 'Figma',
    location: 'San Francisco, CA',
    appliedDate: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    status: 'Reviewing' as const,
    atsScore: 91,
    tailoredResumeSummary: 'Tailored with emphasis on canvas interactions and TypeScript type safety.'
  },
  {
    id: 'app-3',
    jobId: 'job-prev-3',
    jobTitle: 'Backend Platform Engineer',
    company: 'Shopify',
    location: 'Remote',
    appliedDate: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
    status: 'Applied' as const,
    atsScore: 88,
    tailoredResumeSummary: 'Optimized for high-volume order processing and Docker microservices.'
  }
];
