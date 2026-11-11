import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollJourney } from '@/context/ScrollJourneyContext';
import { getDeviceTier } from '@/three/utils/performance';
import { createCircleTexture } from '@/three/utils/createCircleTexture';

interface NebulaFieldsProps {
  reducedMotion: boolean;
}

const CLOUDS = [
  { center: [8, 4, -18] as const, color: '#f9a8d4', spread: 9 },
  { center: [-10, 3, -36] as const, color: '#c4b5fd', spread: 11 },
  { center: [5, 5, -52] as const, color: '#fdba74', spread: 12 },
  { center: [-6, 2.5, -74] as const, color: '#fda4af', spread: 10 },
  { center: [3, 4, -90] as const, color: '#fde68a', spread: 9 },
  { center: [-8, 3, -108] as const, color: '#5eead4', spread: 14 },
  { center: [6, 4, -114] as const, color: '#e879f9', spread: 15 },
  { center: [10, 2, -102] as const, color: '#fb7185', spread: 12 },
];

function pointsForTier(tier: 'low' | 'medium' | 'high') {
  switch (tier) {
    case 'low':
      return 120;
    case 'medium':
      return 200;
    case 'high':
      return 320;
  }
}

export function NebulaFields({ reducedMotion }: NebulaFieldsProps) {
  const { beat, progress } = useScrollJourney();
  const pointsRef = useRef<THREE.Points>(null);
  const perCloud = useMemo(() => pointsForTier(getDeviceTier()), []);
  const circleMap = useMemo(() => createCircleTexture(64), []);

  const { positions, colors } = useMemo(() => {
    const total = CLOUDS.length * perCloud;
    const pos = new Float32Array(total * 3);
    const col = new Float32Array(total * 3);
    let cursor = 0;

    CLOUDS.forEach((cloud) => {
      const base = new THREE.Color(cloud.color);
      for (let i = 0; i < perCloud; i += 1) {
        const i3 = cursor * 3;
        // Gaussian-ish cluster so it reads as mist, not a cube field
        const rx = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
        const ry = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
        const rz = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
        pos[i3] = cloud.center[0] + rx * cloud.spread;
        pos[i3 + 1] = cloud.center[1] + ry * cloud.spread * 0.4;
        pos[i3 + 2] = cloud.center[2] + rz * cloud.spread * 1.5;

        const shade = base.clone().offsetHSL(
          (Math.random() - 0.5) * 0.04,
          0,
          (Math.random() - 0.5) * 0.2,
        );
        col[i3] = shade.r;
        col[i3 + 1] = shade.g;
        col[i3 + 2] = shade.b;
        cursor += 1;
      }
    });

    return { positions: pos, colors: col };
  }, [perCloud]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity =
      beat === 'intro'
        ? 0.22
        : beat === 'rising'
          ? 0.34
          : beat === 'climax'
            ? 0.5
            : beat === 'resolution'
              ? 0.62
              : 0.28 + (1 - progress) * 0.1;

    if (!reducedMotion) {
      pointsRef.current.rotation.y = clock.elapsedTime * 0.008;
    }
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={circleMap}
        size={0.85}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.28}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
