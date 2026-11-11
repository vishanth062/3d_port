import type { ProfileData } from '@/types/portfolio';

export const profile: ProfileData = {
  name: 'Vishanth',
  headline:
    'Full-Stack Software Engineer · React · TypeScript · Node.js · AWS Serverless',
  location: 'Karkala, Udupi, Karnataka, India',
  email: 'vishanth453@gmail.com',
  phone: '+91 8431623876',
  summary:
    'Full-stack software engineer with 2.5 years at 7EDGE building multi-tenant SaaS on React, TypeScript, Node.js, and AWS serverless across hospitality and healthcare.',
  about: [
    'I design and ship multi-tenant SaaS systems end to end — from Aurora PostgreSQL billing ledgers and Cedar authorization policies to React 19 product surfaces that clients use daily.',
    'At 7EDGE I grew from frontend delivery on Wave into owning backend services, schemas, and authorization on Pozytron, while creating internal platforms like ArchGuard and the Sales Demo Room.',
    'I care about architecture that stays maintainable under change: domain boundaries, typed contracts, automated quality gates, and tooling that helps teams move faster without drifting.',
  ],
  resumeUrl: '/resume/Vishanth_Resume.pdf',
  socials: [
    {
      id: 'github',
      label: 'GitHub',
      href: 'https://github.com/vishanth062',
      external: true,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/vishanth453',
      external: true,
    },
    {
      id: 'email',
      label: 'Email',
      href: 'mailto:vishanth453@gmail.com?subject=Let%27s%20talk&body=Hi%20Vishanth%2C%0A%0A',
    },
  ],
};
