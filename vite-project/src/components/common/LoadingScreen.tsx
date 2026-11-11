import { useState } from 'react';
import { cn } from '@/utils/cn';
import styles from './LoadingScreen.module.css';

interface LoadingScreenProps {
  ready: boolean;
}

export function LoadingScreen({ ready }: LoadingScreenProps) {
  const [removed, setRemoved] = useState(false);

  if (removed) {
    return null;
  }

  return (
    <div
      className={cn(styles.overlay, ready && styles.hide)}
      aria-hidden={ready}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && ready) {
          setRemoved(true);
        }
      }}
    >
      <div className={styles.mark} />
      <p>Entering orbit…</p>
    </div>
  );
}
