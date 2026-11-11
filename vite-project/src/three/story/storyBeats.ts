export type StoryBeat = 'intro' | 'flyby' | 'rising' | 'climax' | 'resolution';

export interface StoryBeatMeta {
  id: StoryBeat;
  label: string;
  line: string;
}

export const STORY_BEATS: Record<StoryBeat, StoryBeatMeta> = {
  intro: {
    id: 'intro',
    label: 'Prologue',
    line: 'A quiet core waits at the edge of the void.',
  },
  flyby: {
    id: 'flyby',
    label: 'Flyby',
    line: 'It banks across, spins ninety, then drifts ahead.',
  },
  rising: {
    id: 'rising',
    label: 'Crossing',
    line: 'Debris, beacons, and stations open the path.',
  },
  climax: {
    id: 'climax',
    label: 'Constellation',
    line: 'Project worlds ignite under the Milky Way.',
  },
  resolution: {
    id: 'resolution',
    label: 'Arrival',
    line: 'The corridor settles. One last signal ahead.',
  },
};

/** Scroll window where the craft fills the camera view. */
export const FLYBY_RANGE = { start: 0.14, end: 0.4 } as const;

export function beatFromProgress(progress: number): StoryBeat {
  if (progress < FLYBY_RANGE.start) return 'intro';
  if (progress < FLYBY_RANGE.end) return 'flyby';
  if (progress < 0.48) return 'rising';
  if (progress < 0.74) return 'climax';
  return 'resolution';
}

export function flybyAmount(progress: number): number {
  if (progress <= FLYBY_RANGE.start) return 0;
  if (progress >= FLYBY_RANGE.end) return 1;
  return (progress - FLYBY_RANGE.start) / (FLYBY_RANGE.end - FLYBY_RANGE.start);
}

export function isCraftFlyby(progress: number): boolean {
  return progress >= FLYBY_RANGE.start && progress <= FLYBY_RANGE.end;
}

/** Soft envelope peaks inside each act for lighting / FX intensity. */
export function beatIntensity(progress: number, beat: StoryBeat): number {
  switch (beat) {
    case 'intro':
      return 0.35 + progress * 1.2;
    case 'flyby':
      return 0.9 + Math.sin(flybyAmount(progress) * Math.PI) * 0.35;
    case 'rising':
      return 0.55 + (progress - FLYBY_RANGE.end) * 1.2;
    case 'climax':
      return 0.85 + Math.sin((progress - 0.48) * Math.PI) * 0.35;
    case 'resolution':
      return 0.55 + (1 - progress) * 0.35;
  }
}
