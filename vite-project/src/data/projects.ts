import type { ProjectItem } from '@/types/portfolio';

export const projects: ProjectItem[] = [
  {
    id: 'pozytron',
    name: 'Pozytron',
    tagline: 'Multi-tenant radiology compliance platform',
    domain: 'Healthcare SaaS',
    role: 'Cloud Native Engineer',
    period: 'Jan 2026 – Sep 2026',
    stack: [
      'Node.js',
      'AWS Lambda',
      'ECS Fargate',
      'Aurora PostgreSQL',
      'React 19',
      'Cedar / Verified Permissions',
      'Cognito',
    ],
    highlights: [
      'Built 8 of 21 DDD backend services spanning subscriptions, offers, billing, service requests, dynamic forms, and QMS.',
      'Designed the initial billing domain and append-only ledger schema with immutability triggers, reversal checks, and partial unique indexes.',
      'Implemented fine-grained authorization with Verified Permissions (Cedar) policies and privilege gates across 4 services on Cognito JWT.',
      'Delivered React 19 screens across client, facility, service, task-form, and QMS modules, plus 14 shared UI components.',
    ],
  },
  {
    id: 'wave',
    name: 'Wave Hospitality Admin Portal (TPVision)',
    tagline: 'Hospitality operations and device management suite',
    domain: 'Hospitality SaaS',
    role: 'Frontend & Mobile Engineer',
    period: 'Nov 2024 – Jan 2026',
    stack: ['React 18', 'React Native (Expo)', 'TypeScript', 'Apollo GraphQL', 'Auth0'],
    highlights: [
      'Second-largest contributor (700+ commits); built the PMS module covering reservations, calendar, check-in/out, guest messaging, and remote TV control.',
      'Built TV configuration and firmware workflows: schema-driven config editor, XML generation, and S3 firmware validation.',
      'Implemented user and privilege management with Auth0 and RBAC route guards; wrote 30 GraphQL operations and 50 test suites.',
      'Shipped React Native (Expo) operator features for on-site device listing, configuration, and TV setup via scanning.',
    ],
  },
  {
    id: 'archguard',
    name: 'ArchGuard',
    tagline: 'Architecture governance CLI and MCP server',
    domain: 'Internal Developer Tooling',
    role: 'Creator',
    period: 'Aug 2026 – Sep 2026',
    stack: ['TypeScript', 'Node.js', 'Model Context Protocol', 'Static Analysis'],
    highlights: [
      'Designed and built a 12k-line TypeScript static-analysis CLI with import-graph scanning, 21 rules, and health scoring.',
      'Exposed 21 MCP tools to Claude Code for architecture review, AI-assisted fixes, dependency risk, and live browser debugging (Web Vitals).',
    ],
  },
  {
    id: 'demo-room',
    name: '7EDGE Sales Demo Room',
    tagline: 'In-browser live product demo platform',
    domain: 'Internal Sales Platform',
    role: 'Creator',
    period: 'Oct 2026',
    stack: ['React', 'Vite', 'Expo', 'Mock Service Worker'],
    highlights: [
      'Built a platform running 11 live client-product prototypes across 7 products and 5 industries, fully in-browser with MSW-mocked APIs and seeded data.',
      'Wrote rebranding build plugins (Vite, Metro, webpack) and a TypeScript-AST i18n transform that translated 1,900+ UI strings from Polish to English.',
    ],
  },
];
