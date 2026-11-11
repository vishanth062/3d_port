import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpacePropsProps {
  reducedMotion: boolean;
}

type PropKind =
  | 'asteroid'
  | 'satellite'
  | 'station'
  | 'crystal'
  | 'antenna'
  | 'cargo';

interface PropItem {
  kind: PropKind;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  speed: number;
  color: string;
}

const COLORS = ['#e7e5e4', '#fde68a', '#fdba74', '#c4b5fd', '#a5b4fc', '#f9a8d4'];

/**
 * Non-planet space clutter: asteroids, satellites, stations, crystals, antennas.
 */
export function SpaceProps({ reducedMotion }: SpacePropsProps) {
  const groupRef = useRef<THREE.Group>(null);

  const items = useMemo<PropItem[]>(() => {
    const kinds: PropKind[] = [
      'asteroid',
      'satellite',
      'station',
      'crystal',
      'antenna',
      'cargo',
    ];
    return Array.from({ length: 28 }, (_, i) => {
      const seed = i * 19.7;
      return {
        kind: kinds[i % kinds.length]!,
        position: [
          Math.sin(seed) * (7 + (i % 6)),
          0.4 + Math.cos(seed * 1.4) * 3.4,
          -6 - (i / 28) * 95,
        ],
        rotation: [seed * 0.2, seed * 0.33, seed * 0.11],
        scale: 0.45 + (i % 5) * 0.16,
        speed: 0.1 + (i % 4) * 0.04,
        color: COLORS[i % COLORS.length]!,
      };
    });
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const item = items[i];
      if (!item) return;
      child.rotation.x += item.speed * 0.008;
      child.rotation.y += item.speed * 0.012;
      child.position.y = item.position[1] + Math.sin(t * item.speed + i) * 0.22;
    });
  });

  return (
    <group ref={groupRef}>
      {items.map((item, i) => (
        <group
          key={i}
          position={item.position}
          rotation={item.rotation}
          scale={item.scale}
        >
          {item.kind === 'asteroid' && (
            <mesh>
              <dodecahedronGeometry args={[0.7, 0]} />
              <meshStandardMaterial
                color={item.color}
                flatShading
                roughness={0.85}
                metalness={0.15}
              />
            </mesh>
          )}

          {item.kind === 'satellite' && (
            <>
              <mesh>
                <boxGeometry args={[0.35, 0.25, 0.5]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
              </mesh>
              <mesh position={[0.55, 0, 0]}>
                <boxGeometry args={[0.7, 0.04, 0.35]} />
                <meshStandardMaterial
                  color="#38bdf8"
                  emissive="#0284c7"
                  emissiveIntensity={0.4}
                />
              </mesh>
              <mesh position={[-0.55, 0, 0]}>
                <boxGeometry args={[0.7, 0.04, 0.35]} />
                <meshStandardMaterial
                  color="#38bdf8"
                  emissive="#0284c7"
                  emissiveIntensity={0.4}
                />
              </mesh>
            </>
          )}

          {item.kind === 'station' && (
            <>
              <mesh>
                <boxGeometry args={[0.8, 0.25, 0.25]} />
                <meshBasicMaterial color={item.color} wireframe transparent opacity={0.55} />
              </mesh>
              <mesh>
                <boxGeometry args={[0.25, 0.8, 0.25]} />
                <meshBasicMaterial color={item.color} wireframe transparent opacity={0.55} />
              </mesh>
              <mesh>
                <boxGeometry args={[0.25, 0.25, 0.8]} />
                <meshBasicMaterial color={item.color} wireframe transparent opacity={0.55} />
              </mesh>
            </>
          )}

          {item.kind === 'crystal' && (
            <mesh>
              <octahedronGeometry args={[0.7, 0]} />
              <meshStandardMaterial
                color={item.color}
                emissive={item.color}
                emissiveIntensity={0.35}
                roughness={0.2}
                metalness={0.5}
                transparent
                opacity={0.85}
              />
            </mesh>
          )}

          {item.kind === 'antenna' && (
            <>
              <mesh>
                <cylinderGeometry args={[0.05, 0.08, 1.2, 6]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
              </mesh>
              <mesh position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.28, 0.02, 6, 24]} />
                <meshBasicMaterial color="#fde68a" />
              </mesh>
              <mesh position={[0, 0.35, 0]} rotation={[0.4, 0, 0]}>
                <boxGeometry args={[0.45, 0.02, 0.2]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.6} roughness={0.4} />
              </mesh>
            </>
          )}

          {item.kind === 'cargo' && (
            <mesh>
              <boxGeometry args={[0.7, 0.45, 0.9]} />
              <meshBasicMaterial color={item.color} wireframe transparent opacity={0.5} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
