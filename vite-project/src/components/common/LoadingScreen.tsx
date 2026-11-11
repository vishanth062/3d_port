import { useState } from 'react';
import { cn } from '@/utils/cn';
import { profile } from '@/data/profile';
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
      aria-live="polite"
      aria-busy={!ready}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && ready) {
          setRemoved(true);
        }
      }}
    >
      <div className={styles.atmosphere} aria-hidden />
      <div className={styles.horizon} aria-hidden />

      <div className={styles.stage}>
        <div className={styles.orbitSystem} aria-hidden>
          <div className={styles.ringOuter} />
          <div className={styles.ringDashed} />
          <div className={styles.ringGlow} />
          <div className={styles.core}>
            <span className={styles.coreInner} />
          </div>
          <div className={styles.craftTrack}>
            <span className={styles.craft}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path
                  d="M12 2 L15.2 10.5 L21 12 L15.2 13.5 L12 22 L8.8 13.5 L3 12 L8.8 10.5 Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </div>
          <span className={styles.tick} />
          <span className={styles.tick} data-pos="2" />
          <span className={styles.tick} data-pos="3" />
          <span className={styles.tick} data-pos="4" />
        </div>

        <div className={styles.copy}>
          <p className={styles.brand}>{profile.name}</p>
          <p className={styles.status}>
            <span className={styles.statusDot} />
            Orbital lock in progress
          </p>
          <div className={styles.meter} role="progressbar" aria-valuemin={0} aria-valuemax={100}>
            <span className={styles.meterFill} />
          </div>
        </div>
      </div>
    </div>
  );
}
