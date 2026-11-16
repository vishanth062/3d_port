import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createEarthMaps } from '@/three/utils/createEarthTexture';
import { getDeviceTier, textureSizeForTier } from '@/three/utils/performance';

interface OrbitalCoreProps {
  reducedMotion: boolean;
}

const NODE_COUNT = 7;
/** Full calm → volcanic → ice → calm loop (seconds). */
const CLIMATE_CYCLE = 72;

const COLOR_CALM = new THREE.Color('#5eead4');
const COLOR_VOLCANIC = new THREE.Color('#ff8a3d');
const COLOR_ICE = new THREE.Color('#9fd8ff');
const ATM_A_CALM = new THREE.Color('#1d4ed8');
const ATM_A_VOLCANIC = new THREE.Color('#9a3412');
const ATM_A_ICE = new THREE.Color('#1e3a8a');
const ATM_B_CALM = new THREE.Color('#86efac');
const ATM_B_VOLCANIC = new THREE.Color('#fb923c');
const ATM_B_ICE = new THREE.Color('#bae6fd');
const LIGHT_A_CALM = new THREE.Color('#93c5fd');
const LIGHT_A_VOLCANIC = new THREE.Color('#fdba74');
const LIGHT_A_ICE = new THREE.Color('#bfdbfe');
const LIGHT_B_CALM = new THREE.Color('#86efac');
const LIGHT_B_VOLCANIC = new THREE.Color('#f97316');
const LIGHT_B_ICE = new THREE.Color('#e0f2fe');

/**
 * Soft climate weights over one loop:
 * calm → volcanic warmth → ice age → calm again.
 */
function climateWeights(phase: number) {
  // phase in [0, 1)
  const volcanic = THREE.MathUtils.clamp(
    Math.sin(((phase - 0.08) / 0.34) * Math.PI),
    0,
    1,
  );
  const ice = THREE.MathUtils.clamp(Math.sin(((phase - 0.38) / 0.36) * Math.PI), 0, 1);
  return { volcanic, ice };
}

/**
 * Prologue hero planet — slow climate morph (warm → ice → calm).
 */
export function OrbitalCore({ reducedMotion }: OrbitalCoreProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const volcanicRef = useRef<THREE.Mesh>(null);
  const iceRef = useRef<THREE.Mesh>(null);
  const atmARef = useRef<THREE.Mesh>(null);
  const atmBRef = useRef<THREE.Mesh>(null);
  const railRef = useRef<THREE.Group>(null);
  const lightARef = useRef<THREE.PointLight>(null);
  const lightBRef = useRef<THREE.PointLight>(null);
  const target = useRef({ x: 0, y: 0 });
  const emissiveMix = useRef(new THREE.Color());

  const maps = useMemo(() => {
    const size = Math.min(768, textureSizeForTier(getDeviceTier()));
    return {
      calm: createEarthMaps(size, 'ocean'),
      volcanic: createEarthMaps(size, 'volcanic'),
      ice: createEarthMaps(size, 'ice'),
    };
  }, []);

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
      if (volcanicRef.current) volcanicRef.current.rotation.y = t * 0.08;
      if (iceRef.current) iceRef.current.rotation.y = t * 0.08;
    }
    if (railRef.current && !reducedMotion) {
      railRef.current.rotation.z = t * 0.22;
    }

    const phase = reducedMotion ? 0 : (t % CLIMATE_CYCLE) / CLIMATE_CYCLE;
    const { volcanic, ice } = climateWeights(phase);

    const volcanicMat = volcanicRef.current?.material as
      THREE.MeshStandardMaterial | undefined;
    const iceMat = iceRef.current?.material as THREE.MeshStandardMaterial | undefined;
    const calmMat = planetRef.current?.material as THREE.MeshStandardMaterial | undefined;
    const atmA = atmARef.current?.material as THREE.MeshBasicMaterial | undefined;
    const atmB = atmBRef.current?.material as THREE.MeshBasicMaterial | undefined;

    if (volcanicMat) volcanicMat.opacity = volcanic * 0.78;
    if (iceMat) iceMat.opacity = ice * 0.82;
    if (calmMat) {
      emissiveMix.current
        .copy(COLOR_CALM)
        .lerp(COLOR_VOLCANIC, volcanic * 0.75)
        .lerp(COLOR_ICE, ice * 0.75);
      calmMat.emissive.copy(emissiveMix.current);
      calmMat.emissiveIntensity = 0.95 + volcanic * 0.55 + ice * 0.2;
    }

    if (atmA) {
      atmA.color.copy(ATM_A_CALM).lerp(ATM_A_VOLCANIC, volcanic).lerp(ATM_A_ICE, ice);
      atmA.opacity = 0.12 + volcanic * 0.08 + ice * 0.06;
    }
    if (atmB) {
      atmB.color.copy(ATM_B_CALM).lerp(ATM_B_VOLCANIC, volcanic).lerp(ATM_B_ICE, ice);
      atmB.opacity = 0.06 + volcanic * 0.08 + ice * 0.05;
    }

    if (lightARef.current) {
      lightARef.current.color
        .copy(LIGHT_A_CALM)
        .lerp(LIGHT_A_VOLCANIC, volcanic)
        .lerp(LIGHT_A_ICE, ice);
      lightARef.current.intensity = 1.45 + volcanic * 0.55 + ice * 0.25;
    }
    if (lightBRef.current) {
      lightBRef.current.color
        .copy(LIGHT_B_CALM)
        .lerp(LIGHT_B_VOLCANIC, volcanic)
        .lerp(LIGHT_B_ICE, ice);
      lightBRef.current.intensity = 0.5 + volcanic * 0.45 + ice * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[1.6, 0.25, 0.6]} scale={1.25}>
      {/* Calm base */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[1.15, 64, 64]} />
        <meshStandardMaterial
          map={maps.calm.color}
          emissiveMap={maps.calm.emissive}
          emissive="#5eead4"
          emissiveIntensity={1.15}
          roughness={0.52}
          metalness={0.12}
        />
      </mesh>

      {/* Soft volcanic overlay */}
      <mesh ref={volcanicRef} scale={1.001}>
        <sphereGeometry args={[1.15, 48, 48]} />
        <meshStandardMaterial
          map={maps.volcanic.color}
          emissiveMap={maps.volcanic.emissive}
          emissive="#ff8a3d"
          emissiveIntensity={1.35}
          roughness={0.55}
          metalness={0.1}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Soft ice overlay */}
      <mesh ref={iceRef} scale={1.002}>
        <sphereGeometry args={[1.15, 48, 48]} />
        <meshStandardMaterial
          map={maps.ice.color}
          emissiveMap={maps.ice.emissive}
          emissive="#9fd8ff"
          emissiveIntensity={0.95}
          roughness={0.48}
          metalness={0.08}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere rim */}
      <mesh ref={atmARef} scale={1.06}>
        <sphereGeometry args={[1.15, 48, 48]} />
        <meshBasicMaterial
          color="#1d4ed8"
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={atmBRef} scale={1.12}>
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
            position={[Math.cos(node.angle) * 1.85, Math.sin(node.angle) * 1.85, 0]}
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

      <pointLight
        ref={lightARef}
        position={[2.5, 1.5, 2]}
        color="#93c5fd"
        intensity={1.6}
        distance={12}
      />
      <pointLight
        ref={lightBRef}
        position={[-2, 0.5, 1]}
        color="#86efac"
        intensity={0.55}
        distance={10}
      />
    </group>
  );
}
