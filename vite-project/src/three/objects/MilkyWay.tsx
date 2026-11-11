import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollJourney } from '@/context/ScrollJourneyContext';
import { getDeviceTier } from '@/three/utils/performance';
import { createCircleTexture } from '@/three/utils/createCircleTexture';
import { createGalaxyTexture } from '@/three/utils/createGalaxyTexture';

interface MilkyWayProps {
  reducedMotion: boolean;
}

function sparkCount(tier: 'low' | 'medium' | 'high') {
  switch (tier) {
    case 'low':
      return 700;
    case 'medium':
      return 1200;
    case 'high':
      return 1800;
  }
}

/**
 * Soft galaxy band (plane) — larger, with feathered edges that blend into space.
 * No sky-dome (avoids pixelation / stretch artifacts).
 */
export function MilkyWay({ reducedMotion }: MilkyWayProps) {
  const { beat, progress } = useScrollJourney();
  const groupRef = useRef<THREE.Group>(null);
  const plateRef = useRef<THREE.MeshBasicMaterial>(null);
  const glowRef = useRef<THREE.MeshBasicMaterial>(null);
  const sparksRef = useRef<THREE.Points>(null);
  const galaxyMap = useMemo(() => createGalaxyTexture(2048, 1024), []);
  const circleMap = useMemo(() => createCircleTexture(64), []);
  const count = useMemo(() => sparkCount(getDeviceTier()), []);

  const sparks = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      '#ffffff',
      '#fde68a',
      '#f9a8d4',
      '#c4b5fd',
      '#fdba74',
      '#bae6fd',
    ];

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.pow(Math.random(), 0.55) * 42;
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = (Math.random() - 0.5) * (1.2 + radius * 0.012);
      positions[i3 + 2] = Math.sin(angle) * radius * 0.36;

      const c = new THREE.Color(
        palette[Math.floor(Math.random() * palette.length)]!,
      );
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const reveal =
      beat === 'intro'
        ? 0.5 + progress * 0.35
        : beat === 'rising'
          ? 0.7
          : beat === 'climax'
            ? 0.9
            : 0.72;

    if (plateRef.current) {
      plateRef.current.opacity = Math.min(0.88, reveal);
    }
    if (glowRef.current) {
      glowRef.current.opacity = Math.min(0.22, reveal * 0.25);
    }
    if (sparksRef.current) {
      (sparksRef.current.material as THREE.PointsMaterial).opacity =
        reveal * 0.85;
    }

    if (!reducedMotion) {
      groupRef.current.rotation.z =
        -0.28 + Math.sin(clock.elapsedTime * 0.03) * 0.02;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[2, 10, -32]}
      rotation={[0.16, 0.1, -0.28]}
    >
      {/* Soft outer glow — larger, more transparent, helps blend */}
      <mesh scale={[110, 48, 1]} position={[0, 0, -0.4]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={glowRef}
          color="#c4b5fd"
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          fog={false}
        />
      </mesh>

      {/* Main galaxy plate — oversized so soft edges dissolve off-frame */}
      <mesh scale={[96, 40, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={plateRef}
          map={galaxyMap}
          transparent
          opacity={0.75}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          fog={false}
        />
      </mesh>

      <points ref={sparksRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={sparks.positions.length / 3}
            array={sparks.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={sparks.colors.length / 3}
            array={sparks.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          map={circleMap}
          size={0.09}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.75}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </points>
    </group>
  );
}
