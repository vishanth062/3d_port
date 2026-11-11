import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createEarthMaps } from '@/three/utils/createEarthTexture';

interface OrbitalCoreProps {
  reducedMotion: boolean;
}

const NODE_COUNT = 7;

/**
 * Prologue hero planet — dark-blue oceans, light-green lands, soft teal lights.
 */
export function OrbitalCore({ reducedMotion }: OrbitalCoreProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const railRef = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });
  const maps = useMemo(() => createEarthMaps(768, 'ocean'), []);

  const nodes = useMemo(
    () =>
      Array.from({ length: NODE_COUNT }, (_, i) => ({
        angle: (i / NODE_COUNT) * Math.PI * 2,
        size: 0.06 + (i % 3) * 0.02,
      })),
    [],
  );

  useFrame(({ pointer, clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const t = clock.elapsedTime;

    if (!reducedMotion) {
      target.current.x += (pointer.x - target.current.x) * 0.05;
      target.current.y += (pointer.y - target.current.y) * 0.05;
      group.rotation.y += 0.002 + target.current.x * 0.015;
      group.rotation.x = THREE.MathUtils.lerp(
        group.rotation.x,
        0.12 - target.current.y * 0.12,
        0.05,
      );
    }

    if (planetRef.current && !reducedMotion) {
      planetRef.current.rotation.y = t * 0.08;
    }
    if (railRef.current && !reducedMotion) {
      railRef.current.rotation.z = t * 0.22;
    }
  });

  return (
    <group ref={groupRef} position={[1.6, 0.25, 0.6]} scale={1.25}>
      {/* Planet body */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[1.15, 64, 64]} />
        <meshStandardMaterial
          map={maps.color}
          emissiveMap={maps.emissive}
          emissive="#5eead4"
          emissiveIntensity={1.15}
          roughness={0.52}
          metalness={0.12}
        />
      </mesh>

      {/* Cool atmosphere rim */}
      <mesh scale={1.06}>
        <sphereGeometry args={[1.15, 48, 48]} />
        <meshBasicMaterial
          color="#1d4ed8"
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh scale={1.12}>
        <sphereGeometry args={[1.15, 32, 32]} />
        <meshBasicMaterial
          color="#86efac"
          transparent
          opacity={0.07}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Thin orbital rail with nodes */}
      <group ref={railRef} rotation={[Math.PI / 2.55, 0.35, 0.2]}>
        <mesh>
          <torusGeometry args={[1.85, 0.008, 12, 160]} />
          <meshBasicMaterial color="#5eead4" transparent opacity={0.75} />
        </mesh>
        <mesh>
          <torusGeometry args={[2.15, 0.005, 10, 140]} />
          <meshBasicMaterial color="#bbf7d0" transparent opacity={0.35} />
        </mesh>

        {nodes.map((node, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(node.angle) * 1.85,
              Math.sin(node.angle) * 1.85,
              0,
            ]}
          >
            <sphereGeometry args={[node.size, 12, 12]} />
            <meshStandardMaterial
              color="#0b1020"
              emissive="#5eead4"
              emissiveIntensity={0.9}
              metalness={0.6}
              roughness={0.25}
            />
          </mesh>
        ))}
      </group>

      {/* Soft local key light */}
      <pointLight
        position={[2.5, 1.5, 2]}
        color="#93c5fd"
        intensity={1.6}
        distance={12}
      />
      <pointLight
        position={[-2, 0.5, 1]}
        color="#86efac"
        intensity={0.55}
        distance={10}
      />
    </group>
  );
}
