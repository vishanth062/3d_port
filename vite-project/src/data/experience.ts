import type { ExperienceRole } from '@/types/portfolio';

export const experience: ExperienceRole[] = [
  {
    id: '7edge',
    company: '7EDGE',
    location: 'Mangaluru, Karnataka, India',
    title: 'Software Engineer II, Cloud Native Engineering',
    start: 'Apr 2024',
    end: 'Present',
    promotions: [
      'SDE Trainee → SDE I (Oct 2024)',
      'SDE I → Software Engineer I (Jan 2025)',
      'Software Engineer I → Software Engineer II (Sep 2025)',
    ],
    summary: [
      'Promoted three times in 17 months while expanding from frontend features to backend services, database schemas, and authorization.',
      'Grew from Wave (hospitality) into owning critical domains on Pozytron (healthcare), including billing and fine-grained access control.',
      'Created two internal platforms: ArchGuard for AI-assisted architecture governance, and the Sales Demo Room for live client demos.',
      'Raised the quality bar with pre-commit lint checks, ~350 test files, billing design docs, and 25+ documentation pages.',
      'Client-facing across projects: requirement walkthroughs, demos, feedback-to-delivery loops, and peer mentoring.',
    ],
  },
];
