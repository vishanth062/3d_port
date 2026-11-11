import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useScrollJourney } from '@/context/ScrollJourneyContext';
import {
  createSaturnRingTexture,
  createSaturnTexture,
} from '@/three/utils/createPlanetTexture';

interface ExperienceSaturnProps {
  reducedMotion: boolean;
}

const RADIUS = 5.8;
const RING_INNER = RADIUS * 1.28;
const RING_OUTER = RADIUS * 2.55;

function buildRingSparkles(count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const t = Math.random();
    // Bias sparkles toward denser mid/inner rings
    const radius =
      RING_INNER + Math.pow(t, 0.65) * (RING_OUTER - RING_INNER);
    const angle = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.04;
    positions[i * 3 + 2] = Math.sin(angle) * radius;

    const warm = 0.75 + Math.random() * 0.25;
    colors[i * 3] = warm;
    colors[i * 3 + 1] = warm * (0.75 + Math.random() * 0.2);
    colors[i * 3 + 2] = warm * (0.35 + Math.random() * 0.25);
  }
  return { positions, colors };
}

/**
 * Cinematic Experience Saturn — teal night side, warm lit bands,
 * dense gold rings with ice sparkles (close-up reference look).
 */
export function ExperienceSaturn({ reducedMotion }: ExperienceSaturnProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);
  const sparkRef = useRef<THREE.Points>(null);
  const { station, progress } = useScrollJourney();
  const active =
    station === 'experience' || (progress > 0.32 && progress < 0.52);

  const bodyMap = useMemo(() => createSaturnTexture(1024), []);
  const ringMap = useMemo(() => createSaturnRingTexture(1024), []);
  const sparkles = useMemo(() => buildRingSparkles(5200), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (bodyRef.current && !reducedMotion) {
      bodyRef.current.rotation.y = t * 0.03;
    }
    if (ringRef.current && !reducedMotion) {
      ringRef.current.rotation.z = t * 0.012;
    }
    if (sparkRef.current && !reducedMotion) {
      sparkRef.current.rotation.y = t * 0.018;
    }
  });

  return (
    // Far behind prologue planet; camera passes under rings, not through body
    <group
      ref={groupRef}
      position={[11.5, 3.2, -46]}
      rotation={[0.12, -0.55, 0.08]}
    >
      {/* Warm key from below (ring-lit face) + cool fill for night side */}
      <directionalLight
        position={[2, -6, 4]}
        intensity={2.2}
        color="#ffd59a"
      />
      <directionalLight
        position={[-5, 4, -2]}
        intensity={0.55}
        color="#3b6ea5"
      />
      <pointLight
        position={[0, -RADIUS * 0.9, RADIUS * 0.4]}
        color="#ff9f43"
        intensity={active ? 4.5 : 2.8}
        distance={18}
      />

      {/* Planet body */}
      <mesh ref={bodyRef} rotation={[0, Math.PI * 0.35, 0.08]}>
        <sphereGeometry args={[RADIUS, 96, 96]} />
        <meshStandardMaterial
          map={bodyMap}
          roughness={0.62}
          metalness={0.05}
          emissive="#1a3355"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Bright limb where planet kisses the rings */}
      <mesh scale={1.01} rotation={[0, Math.PI * 0.35, 0.08]}>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <meshBasicMaterial
          color="#ffc878"
          transparent
          opacity={0.07}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Ring plane — wide, dense, tilted for sweep across frame */}
      <group
        ref={ringRef}
        rotation={[Math.PI / 2.15, 0.42, 0.55]}
      >
        <mesh>
          <ringGeometry args={[RING_INNER, RING_OUTER, 192]} />
          <meshBasicMaterial
            map={ringMap}
            transparent
            opacity={0.95}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Second slightly offset pass for depth */}
        <mesh position={[0, 0.015, 0]} rotation={[0.01, 0, 0]}>
          <ringGeometry args={[RING_INNER * 1.02, RING_OUTER * 0.98, 160]} />
          <meshBasicMaterial
            map={ringMap}
            transparent
            opacity={0.45}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Hot inner ring glow */}
        <mesh>
          <ringGeometry args={[RING_INNER, RING_INNER * 1.18, 128]} />
          <meshBasicMaterial
            color="#ff9f43"
            transparent
            opacity={active ? 0.55 : 0.35}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[RING_INNER * 1.06, 0.035, 10, 180]} />
          <meshBasicMaterial
            color="#ffb347"
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh>
          <torusGeometry args={[RING_OUTER * 0.92, 0.012, 8, 180]} />
          <meshBasicMaterial
            color="#ffe0a3"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Ice / dust sparkles in the ring plane */}
        <points ref={sparkRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[sparkles.positions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[sparkles.colors, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.045}
            vertexColors
            transparent
            opacity={0.85}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            sizeAttenuation
          />
        </points>
      </group>

      {active && (
        <Html
          position={[-4.5, -3.8, 2]}
          center
          distanceFactor={26}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              color: '#fde68a',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '0.72rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              opacity: 0.95,
              whiteSpace: 'nowrap',
              textShadow: '0 0 16px rgba(0,0,0,0.9)',
            }}
          >
            Experience
          </div>
        </Html>
      )}
    </group>
  );
}
