import type { SkillCategory } from '@/types/portfolio';

export const skillCategories: SkillCategory[] = [
  {
    id: 'languages',
    title: 'Languages',
    skills: [
      'TypeScript',
      'JavaScript (ES6+)',
      'SQL',
      'Python (Alembic)',
      'HTML5',
      'CSS3',
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend',
    skills: [
      'React 18/19',
      'React Native (Expo)',
      'Redux Toolkit',
      'Zustand',
      'Apollo Client (GraphQL)',
      'TanStack Table',
      'Vite',
    ],
  },
  {
    id: 'backend',
    title: 'Backend & Cloud',
    skills: [
      'Node.js',
      'AWS Lambda (Serverless)',
      'Aurora PostgreSQL',
      'Knex',
      'Zod',
      'Cognito',
      'Verified Permissions (Cedar)',
      'S3',
      'Auth0',
    ],
  },
  {
    id: 'architecture',
    title: 'Architecture & AI',
    skills: [
      'Domain-Driven Design',
      'Multi-tenant SaaS',
      'RBAC',
      'Claude Code',
      'Model Context Protocol (MCP)',
      'Static Analysis',
    ],
  },
  {
    id: 'quality',
    title: 'Quality & Delivery',
    skills: [
      'Jest',
      'React Testing Library',
      'Mock Service Worker',
      'ESLint',
      'Husky',
      'Git',
      'Azure DevOps',
      'GitLab',
      'Jira',
    ],
  },
];
