import { useScrollJourney } from '@/context/ScrollJourneyContext';
import { STORY_BEATS } from '@/three/story/storyBeats';
import styles from './JourneyHUD.module.css';

export function JourneyHUD() {
  const { progress, beat, station } = useScrollJourney();
  const meta = STORY_BEATS[beat];
  const pct = Math.round(progress * 100);
  const aboveFooter =
    station === 'contact' || beat === 'resolution' || progress > 0.9;

  return (
    <div
      className={`${styles.hud}${aboveFooter ? ` ${styles.hudFinale}` : ''}`}
      aria-hidden
    >
      <div className={styles.row}>
        <div className={styles.radar}>
          <svg viewBox="0 0 64 64" className={styles.radarSvg}>
            <circle cx="32" cy="32" r="28" />
            <circle cx="32" cy="32" r="18" />
            <circle cx="32" cy="32" r="8" />
            <line x1="32" y1="4" x2="32" y2="60" />
            <line x1="4" y1="32" x2="60" y2="32" />
            <polygon points="32,10 38,28 32,24 26,28" className={styles.beam} />
            <circle cx="44" cy="20" r="1.6" className={styles.dot} />
            <circle cx="18" cy="40" r="1.4" className={styles.dot} />
            <circle cx="48" cy="42" r="1.2" className={styles.dot} />
            <circle cx="22" cy="18" r="1.1" className={styles.dot} />
          </svg>
        </div>

        <div className={styles.station}>
          <span className={styles.eyebrow}>Story beat</span>
          <strong>{meta.label}</strong>
          <p className={styles.line}>{meta.line}</p>
        </div>
      </div>

      <div className={styles.meter}>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${pct}%` }} />
          <span className={styles.thumb} style={{ left: `${pct}%` }} />
        </div>
        <span className={styles.pct}>{pct}%</span>
      </div>

      {progress < 0.08 && (
        <p className={styles.hint}>Scroll to begin the voyage</p>
      )}
      {beat === 'flyby' && (
        <p className={styles.hint}>Banks across · spins · drifts forward</p>
      )}
    </div>
  );
}
