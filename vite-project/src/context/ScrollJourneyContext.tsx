import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  beatFromProgress,
  type StoryBeat,
} from '@/three/story/storyBeats';

export type JourneyStation =
  | 'hero'
  | 'about'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'education'
  | 'contact';

interface ScrollJourneyValue {
  progress: number;
  station: JourneyStation;
  beat: StoryBeat;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
}

const ScrollJourneyContext = createContext<ScrollJourneyValue | null>(null);

function stationFromProgress(progress: number): JourneyStation {
  if (progress < 0.12) return 'hero';
  if (progress < 0.28) return 'about';
  if (progress < 0.44) return 'experience';
  if (progress < 0.68) return 'projects';
  if (progress < 0.78) return 'skills';
  if (progress < 0.9) return 'education';
  return 'contact';
}

export function ScrollJourneyProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const next = maxScroll > 0 ? window.scrollY / maxScroll : 0;
      setProgress(Math.min(1, Math.max(0, next)));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const value = useMemo(
    () => ({
      progress,
      station: stationFromProgress(progress),
      beat: beatFromProgress(progress),
      selectedProjectId,
      setSelectedProjectId,
    }),
    [progress, selectedProjectId],
  );

  return (
    <ScrollJourneyContext.Provider value={value}>
      {children}
    </ScrollJourneyContext.Provider>
  );
}

export function useScrollJourney() {
  const ctx = useContext(ScrollJourneyContext);
  if (!ctx) {
    throw new Error('useScrollJourney must be used within ScrollJourneyProvider');
  }
  return ctx;
}
