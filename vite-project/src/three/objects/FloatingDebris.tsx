import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getDeviceTier } from '@/three/utils/performance';

interface FloatingDebrisProps {
  reducedMotion: boolean;
}

function countForTier(tier: 'low' | 'medium' | 'high') {
  switch (tier) {
    case 'low':
      return 14;
    case 'medium':
      return 24;
    case 'high':
      return 36;
  }
}

export function FloatingDebris({ reducedMotion }: FloatingDebrisProps) {
  const groupRef = useRef<THREE.Group>(null);
  const count = useMemo(() => countForTier(getDeviceTier()), []);

  const items = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const seed = i * 17.13;
      const z = -8 - (i / count) * 95;
      return {
        position: [
          Math.sin(seed) * (6 + (i % 5)),
          Math.cos(seed * 1.3) * 3.2 + 1.2,
          z,
        ] as [number, number, number],
        rotation: [
          seed * 0.2,
          seed * 0.35,
          seed * 0.15,
        ] as [number, number, number],
        scale: 0.35 + (i % 4) * 0.18,
        kind: i % 3,
        speed: 0.12 + (i % 5) * 0.03,
      };
    });
  }, [count]);

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const item = items[i];
      if (!item) return;
      child.rotation.x += item.speed * 0.01;
      child.rotation.y += item.speed * 0.014;
      child.position.y = item.position[1] + Math.sin(t * item.speed + i) * 0.25;
    });
  });

  return (
    <group ref={groupRef}>
      {items.map((item, i) => (
        <mesh
          key={i}
          position={item.position}
          rotation={item.rotation}
          scale={item.scale}
        >
          {item.kind === 0 && <boxGeometry args={[1, 1, 1]} />}
          {item.kind === 1 && <octahedronGeometry args={[0.75, 0]} />}
          {item.kind === 2 && <tetrahedronGeometry args={[0.85, 0]} />}
          <meshBasicMaterial
            color={
              ['#e7e5e4', '#fde68a', '#fdba74', '#c4b5fd', '#a5b4fc'][i % 5]
            }
            wireframe
            transparent
            opacity={0.28}
          />
        </mesh>
      ))}
    </group>
  );
}
