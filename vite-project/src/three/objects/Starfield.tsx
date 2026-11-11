import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getDeviceTier, starCountForTier } from '@/three/utils/performance';
import { createCircleTexture } from '@/three/utils/createCircleTexture';

interface StarfieldProps {
  reducedMotion: boolean;
}

const STAR_COLORS = [
  '#eef3f8',
  '#fde68a',
  '#f9a8d4',
  '#c4b5fd',
  '#fdba74',
  '#bae6fd',
  '#fecdd3',
];

export function Starfield({ reducedMotion }: StarfieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = useMemo(() => starCountForTier(getDeviceTier()), []);
  const circleMap = useMemo(() => createCircleTexture(64), []);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const radius = 14 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.55;
      pos[i3 + 2] = radius * Math.cos(phi) * 1.8 - 40;

      const tint = new THREE.Color(
        STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]!,
      );
      col[i3] = tint.r;
      col[i3 + 1] = tint.g;
      col[i3 + 2] = tint.b;
    }

    return { positions: pos, colors: col };
  }, [count]);

  useFrame(({ clock }) => {
    if (!pointsRef.current || reducedMotion) {
      return;
    }
    pointsRef.current.rotation.y = clock.elapsedTime * 0.012;
    pointsRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.045) * 0.018;
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
        size={0.1}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.95}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
