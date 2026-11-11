import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollJourney } from '@/context/ScrollJourneyContext';
import { getDeviceTier } from '@/three/utils/performance';

interface ShootingStarsProps {
  reducedMotion: boolean;
}

interface Streak {
  active: boolean;
  life: number;
  maxLife: number;
  speed: number;
  origin: THREE.Vector3;
  dir: THREE.Vector3;
  color: THREE.Color;
}

function streakCount(tier: 'low' | 'medium' | 'high') {
  switch (tier) {
    case 'low':
      return 4;
    case 'medium':
      return 7;
    case 'high':
      return 10;
  }
}

const PALETTE = ['#ffd6a5', '#f9a8d4', '#fde68a', '#c4b5fd', '#fda4af', '#e0f2fe'];

export function ShootingStars({ reducedMotion }: ShootingStarsProps) {
  const { progress, beat } = useScrollJourney();
  const count = useMemo(() => streakCount(getDeviceTier()), []);

  const { streaks, lines } = useMemo(() => {
    const streakState: Streak[] = Array.from({ length: count }, () => ({
      active: false,
      life: 0,
      maxLife: 1,
      speed: 1,
      origin: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      color: new THREE.Color(),
    }));

    const lineObjects = streakState.map(() => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(6), 3),
      );
      const mat = new THREE.LineBasicMaterial({
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const line = new THREE.Line(geo, mat);
      line.visible = false;
      line.frustumCulled = false;
      return line;
    });

    return { streaks: streakState, lines: lineObjects };
  }, [count]);

  const spawn = (streak: Streak, cameraZ: number) => {
    const side = Math.random() > 0.5 ? 1 : -1;
    streak.origin.set(
      side * (8 + Math.random() * 10),
      3 + Math.random() * 6,
      cameraZ - 4 - Math.random() * 18,
    );
    streak.dir
      .set(-side * (1.4 + Math.random()), -0.45 - Math.random() * 0.4, -0.2)
      .normalize();
    streak.color.set(PALETTE[Math.floor(Math.random() * PALETTE.length)]!);
    streak.maxLife = 0.55 + Math.random() * 0.55;
    streak.life = streak.maxLife;
    streak.speed = 18 + Math.random() * 22;
    streak.active = true;
  };

  useFrame(({ camera }, delta) => {
    if (reducedMotion) return;

    const rate =
      beat === 'climax'
        ? 0.085
        : beat === 'rising'
          ? 0.045
          : beat === 'intro'
            ? 0.012
            : 0.03;

    streaks.forEach((streak, i) => {
      const line = lines[i];
      if (!line) return;
      const geo = line.geometry;
      const mat = line.material as THREE.LineBasicMaterial;

      if (!streak.active) {
        if (Math.random() < rate * (0.6 + progress)) {
          spawn(streak, camera.position.z);
        } else {
          line.visible = false;
          return;
        }
      }

      streak.life -= delta;
      if (streak.life <= 0) {
        streak.active = false;
        line.visible = false;
        return;
      }

      const traveled = (streak.maxLife - streak.life) * streak.speed;
      const headX = streak.origin.x + streak.dir.x * traveled;
      const headY = streak.origin.y + streak.dir.y * traveled;
      const headZ = streak.origin.z + streak.dir.z * traveled;
      const tailX = headX - streak.dir.x * 2.4;
      const tailY = headY - streak.dir.y * 2.4;
      const tailZ = headZ - streak.dir.z * 2.4;

      const pos = geo.attributes.position as THREE.BufferAttribute;
      pos.setXYZ(0, tailX, tailY, tailZ);
      pos.setXYZ(1, headX, headY, headZ);
      pos.needsUpdate = true;

      mat.color.copy(streak.color);
      mat.opacity = Math.min(1, streak.life * 2.2) * 0.9;
      line.visible = true;
    });
  });

  return (
    <group>
      {lines.map((line, i) => (
        <primitive key={i} object={line} />
      ))}
    </group>
  );
}
