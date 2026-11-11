import type { FoundationItem } from '@/types/portfolio';

export const foundations: FoundationItem[] = [
  {
    id: 'envision',
    title: 'Envision Lab',
    items: [
      'Sensor precision work with low-pass and Butterworth filters',
      'Line-following robot using maze-solver algorithms',
      'Point-cloud pothole detection exploration',
      'AR visiting card in Unity; e-Yantra (IIT Bombay) participation',
    ],
  },
  {
    id: 'space',
    title: 'Alvas Space Explorers',
    items: [
      'Built telescopes as part of a 15-telescope team effort',
      'Talk on telescope working principles at International Jamboree 2022',
      'Led a 7-day star-gazing program at International Jamboree 2022',
    ],
  },
  {
    id: 'edc',
    title: 'Entrepreneurial Development Cell',
    items: [
      'Patent-filing workshop participation',
      'Week-long entrepreneurial skill development workshop',
      'National-level Idea Hackathon college selection team member',
    ],
  },
  {
    id: 'aviation',
    title: 'Aviation Lab',
    items: [
      'Hands-on quadcopter workshop using Pixhawk',
      'RC plane build workshop facilitation team member',
    ],
  },
];
