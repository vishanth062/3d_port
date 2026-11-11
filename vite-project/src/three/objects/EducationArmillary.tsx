import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollJourney } from '@/context/ScrollJourneyContext';
import {
  createArmillaryEmissiveTexture,
  createArmillaryRingTexture,
  createArmillarySphereTexture,
} from '@/three/utils/createPlanetTexture';

interface EducationArmillaryProps {
  reducedMotion: boolean;
}

const COPPER = '#b87333';
const COPPER_BRIGHT = '#e8a25a';
const ORANGE = '#ff8c42';
const BLUE_DARK = '#0b1f3a';
const BLUE_LIT = '#3b82c4';
const PURPLE = '#c084fc';

function OrbitalDrone({
  accent = ORANGE,
}: {
  accent?: string;
}) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial
          color={COPPER}
          metalness={0.92}
          roughness={0.22}
          emissive={COPPER_BRIGHT}
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0, 0, 0.16]}>
        <cylinderGeometry args={[0.06, 0.08, 0.1, 10]} />
        <meshStandardMaterial
          color={BLUE_DARK}
          metalness={0.7}
          roughness={0.3}
          emissive={BLUE_LIT}
          emissiveIntensity={0.4}
        />
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0]}
          >
            <boxGeometry args={[0.05, 0.05, 0.08]} />
            <meshStandardMaterial
              color={COPPER_BRIGHT}
              emissive={accent}
              emissiveIntensity={0.7}
              metalness={0.85}
              roughness={0.25}
            />
          </mesh>
        );
      })}
      <pointLight color={accent} intensity={0.55} distance={2.5} />
    </group>
  );
}

function RingStation() {
  return (
    <group>
      {/* Copper hull */}
      <mesh>
        <boxGeometry args={[0.55, 0.35, 0.9]} />
        <meshStandardMaterial
          color={COPPER}
          metalness={0.9}
          roughness={0.28}
          emissive={COPPER_BRIGHT}
          emissiveIntensity={0.15}
        />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.35, 0.18, 0.45]} />
        <meshStandardMaterial
          color={COPPER_BRIGHT}
          metalness={0.88}
          roughness={0.25}
        />
      </mesh>
      {/* Blue sensor panels */}
      <mesh position={[0.32, 0.05, 0.1]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.08, 0.28, 0.55]} />
        <meshStandardMaterial
          color={BLUE_DARK}
          emissive={BLUE_LIT}
          emissiveIntensity={0.55}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[-0.32, 0.05, 0.1]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.08, 0.28, 0.55]} />
        <meshStandardMaterial
          color={BLUE_DARK}
          emissive={BLUE_LIT}
          emissiveIntensity={0.55}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      {/* Orange thruster nozzles */}
      {[-0.14, 0.14].map((x, i) => (
        <mesh key={i} position={[x, -0.05, -0.5]}>
          <cylinderGeometry args={[0.06, 0.08, 0.18, 10]} />
          <meshStandardMaterial
            color="#1a0a00"
            emissive={ORANGE}
            emissiveIntensity={1.4}
            metalness={0.5}
            roughness={0.35}
          />
        </mesh>
      ))}
      {/* Purple rear beam */}
      <mesh position={[0, 0, -0.95]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.14, 0.9, 10]} />
        <meshBasicMaterial
          color={PURPLE}
          transparent
          opacity={0.75}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh position={[0, 0, -1.45]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.08, 0.7, 8]} />
        <meshBasicMaterial
          color="#e9d5ff"
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight
        position={[0, 0, -0.7]}
        color={PURPLE}
        intensity={2.4}
        distance={6}
      />
      <pointLight
        position={[0, -0.1, -0.45]}
        color={ORANGE}
        intensity={1.2}
        distance={4}
      />
    </group>
  );
}

/**
 * Holographic tech planet — hex-grid sphere, copper/blue armillary rings,
 * orbital drones + copper station with purple thruster (reference redesign).
 */
export function EducationArmillary({ reducedMotion }: EducationArmillaryProps) {
  const rootRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const dronesRef = useRef<THREE.Group>(null);
  const stationRef = useRef<THREE.Group>(null);
  const { station, progress } = useScrollJourney();

  const active =
    station === 'education' || (progress > 0.72 && progress < 0.92);

  const sphereMap = useMemo(() => createArmillarySphereTexture(1024), []);
  const emissiveMap = useMemo(() => createArmillaryEmissiveTexture(512), []);
  const copperMap = useMemo(() => createArmillaryRingTexture('gold'), []);
  const blueMap = useMemo(() => createArmillaryRingTexture('blue'), []);

  const drones = useMemo(
    () =>
      [
        { ring: 2.35, angle: 0.4 },
        { ring: 2.55, angle: 2.1 },
        { ring: 2.75, angle: 4.0 },
        { ring: 2.2, angle: 5.2 },
      ] as const,
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (ringsRef.current && !reducedMotion) {
      ringsRef.current.rotation.y = t * 0.12;
      ringsRef.current.rotation.x = Math.sin(t * 0.18) * 0.06;
    }
    if (dronesRef.current && !reducedMotion) {
      dronesRef.current.children.forEach((child, i) => {
        const d = drones[i];
        if (!d) return;
        const a = d.angle + t * (0.15 + i * 0.03);
        // Place on tilted ring plane (approx XY then apply ring tilt via parent)
        child.position.set(
          Math.cos(a) * d.ring,
          Math.sin(a) * d.ring * 0.15,
          Math.sin(a) * d.ring,
        );
        child.lookAt(0, 0, 0);
      });
    }
    if (stationRef.current && !reducedMotion) {
      const a = t * 0.08 + 1.2;
      const r = 3.15;
      stationRef.current.position.set(
        Math.cos(a) * r,
        Math.sin(a * 0.7) * 0.35,
        Math.sin(a) * r,
      );
      stationRef.current.lookAt(0, 0, 0);
      stationRef.current.rotateY(Math.PI);
    }
    if (rootRef.current && !reducedMotion) {
      rootRef.current.position.y = 1.85 + Math.sin(t * 0.4) * 0.1;
    }
  });

  return (
    <group ref={rootRef} position={[4.4, 1.85, -80]}>
      <pointLight
        color="#38bdf8"
        intensity={active ? 3.6 : 1.8}
        distance={18}
      />
      <pointLight
        position={[3, 2, 2]}
        color={COPPER_BRIGHT}
        intensity={active ? 1.6 : 0.8}
        distance={12}
      />
      <pointLight
        position={[-2, -1, 3]}
        color={PURPLE}
        intensity={0.7}
        distance={10}
      />

      {/* Holographic hex-grid sphere */}
      <mesh>
        <sphereGeometry args={[1.9, 72, 72]} />
        <meshStandardMaterial
          map={sphereMap}
          emissiveMap={emissiveMap}
          emissive="#7dd3fc"
          emissiveIntensity={active ? 1.35 : 0.85}
          metalness={0.15}
          roughness={0.25}
          transparent
          opacity={0.88}
        />
      </mesh>
      {/* Soft hologram rim */}
      <mesh scale={1.05}>
        <sphereGeometry args={[1.9, 40, 40]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.12}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {/* Inner hex glow core */}
      <mesh>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshBasicMaterial
          color="#bae6fd"
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Intersecting copper / dark-blue armillary rings */}
      <group ref={ringsRef}>
        {[
          {
            rot: [Math.PI / 2, 0.15, 0] as const,
            r: 2.2,
            tube: 0.045,
            map: copperMap,
            emissive: COPPER_BRIGHT,
          },
          {
            rot: [0.55, 0.35, 1.05] as const,
            r: 2.4,
            tube: 0.038,
            map: copperMap,
            emissive: ORANGE,
          },
          {
            rot: [1.2, 0.9, 0.25] as const,
            r: 2.55,
            tube: 0.032,
            map: copperMap,
            emissive: COPPER,
          },
          {
            rot: [Math.PI / 2.3, 0.7, 0.2] as const,
            r: 2.7,
            tube: 0.028,
            map: blueMap,
            emissive: BLUE_LIT,
          },
          {
            rot: [0.25, 1.35, 0.55] as const,
            r: 2.9,
            tube: 0.026,
            map: blueMap,
            emissive: BLUE_DARK,
          },
          {
            rot: [1.55, 0.4, 1.1] as const,
            r: 2.3,
            tube: 0.02,
            map: blueMap,
            emissive: BLUE_LIT,
          },
          {
            rot: [0.9, 0.15, 0.7] as const,
            r: 3.05,
            tube: 0.018,
            map: copperMap,
            emissive: ORANGE,
          },
        ].map((ring, i) => (
          <mesh key={i} rotation={[...ring.rot]}>
            <torusGeometry args={[ring.r, ring.tube, 14, 140]} />
            <meshStandardMaterial
              map={ring.map}
              color="#ffffff"
              metalness={0.92}
              roughness={0.24}
              emissive={ring.emissive}
              emissiveIntensity={0.35}
            />
          </mesh>
        ))}
      </group>

      {/* Golden orbital drones on the rings */}
      <group ref={dronesRef}>
        {drones.map((_, i) => (
          <group key={i}>
            <OrbitalDrone accent={i % 2 === 0 ? ORANGE : COPPER_BRIGHT} />
          </group>
        ))}
      </group>

      {/* Primary copper station + purple thruster */}
      <group ref={stationRef}>
        <RingStation />
      </group>

      {/* Floating crystal shards */}
      <mesh position={[4.2, 2.4, 1.6]} rotation={[0.5, 0.8, 0.3]}>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial
          color="#94a3b8"
          metalness={0.7}
          roughness={0.25}
          emissive="#38bdf8"
          emissiveIntensity={0.25}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh position={[-3.6, 1.2, -1.8]} rotation={[0.2, 1.1, 0.6]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.75}
          roughness={0.2}
          emissive={PURPLE}
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Satellite panel */}
      <mesh position={[5.4, -0.6, -1.2]} rotation={[0.3, 0.5, 0.2]}>
        <boxGeometry args={[0.7, 0.04, 0.35]} />
        <meshStandardMaterial
          color="#1e293b"
          metalness={0.6}
          roughness={0.35}
          emissive={BLUE_LIT}
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh position={[5.4, -0.6, -1.2]} rotation={[0.3, 0.5, 0.2]}>
        <boxGeometry args={[0.18, 0.12, 0.18]} />
        <meshStandardMaterial
          color={COPPER}
          metalness={0.9}
          roughness={0.25}
        />
      </mesh>
    </group>
  );
}
