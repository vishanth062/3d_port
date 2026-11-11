import { lazy, Suspense } from 'react';
import { useWebGLSupport } from '@/hooks/useWebGLSupport';
import styles from './ThreeScene.module.css';

const UniverseScene = lazy(async () => {
  const mod = await import('@/three/scenes/UniverseScene');
  return { default: mod.UniverseScene };
});

export function ThreeScene() {
  const webgl = useWebGLSupport();

  return (
    <div className={styles.canvasWrap} aria-hidden>
      {webgl ? (
        <Suspense fallback={<div className={styles.fallback} />}>
          <UniverseScene />
        </Suspense>
      ) : (
        <div className={styles.fallback} />
      )}
      <div className={styles.vignette} />
    </div>
  );
}
