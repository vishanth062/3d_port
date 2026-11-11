import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { ProjectItem } from '@/types/portfolio';
import { useScrollJourney } from '@/context/ScrollJourneyContext';
import {
  createProjectPlanetMaps,
  type ProjectPlanetStyle,
} from '@/three/utils/createPlanetTexture';

interface ProjectPlanetProps {
  project: ProjectItem;
  index: number;
  reducedMotion: boolean;
}

const STYLES: ProjectPlanetStyle[] = [
  'volcanic',
  'gasband',
  'cratered',
  'storm',
];

const ACCENTS = ['#f97316', '#eab308', '#a8a29e', '#c084fc'];

const MATERIAL: Record<
  ProjectPlanetStyle,
  { roughness: number; metalness: number; emissiveGain: number }
> = {
  volcanic: { roughness: 0.72, metalness: 0.12, emissiveGain: 1.35 },
  gasband: { roughness: 0.48, metalness: 0.08, emissiveGain: 0.7 },
  cratered: { roughness: 0.88, metalness: 0.22, emissiveGain: 0.55 },
  storm: { roughness: 0.4, metalness: 0.15, emissiveGain: 1.1 },
};

/** Project worlds — each gets a unique surface style, size, and ornament. */
export function ProjectPlanet({
  project,
  index,
  reducedMotion,
}: ProjectPlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const scaleTarget = useRef(new THREE.Vector3(1, 1, 1));
  const [hovered, setHovered] = useState(false);
  const { selectedProjectId, setSelectedProjectId, progress } =
    useScrollJourney();

  const selected = selectedProjectId === project.id;
  const style = STYLES[index % STYLES.length]!;
  const accent = ACCENTS[index % ACCENTS.length]!;
  const mat = MATERIAL[style];
  const active = progress > 0.42 && progress < 0.72;
  const lit = hovered || selected;
  const maps = useMemo(
    () => createProjectPlanetMaps(style, index + 1, 512),
    [style, index],
  );

  const base = useMemo(() => {
    const angle = (index / 4) * Math.PI * 2 - Math.PI / 2;
    const radius = 5.0 + (index % 2) * 1.6;
    const sizes = [1.05, 1.45, 0.95, 1.25];
    return {
      x: Math.cos(angle) * radius,
      y: 0.6 + (index % 3) * 0.85,
      z: -46 - index * 2.4,
      size: sizes[index % sizes.length]!,
    };
  }, [index]);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const t = clock.elapsedTime;
    const orbit = reducedMotion ? 0 : t * (0.15 + index * 0.02);
    group.position.x = base.x + Math.cos(orbit + index) * 0.35;
    group.position.y = base.y + Math.sin(orbit * 1.4 + index) * 0.25;
    group.position.z = base.z;
    group.rotation.y = reducedMotion ? index * 0.4 : t * 0.12 + index * 0.2;
    if (planetRef.current && !reducedMotion) {
      planetRef.current.rotation.y = t * (0.06 + index * 0.025);
    }
    if (ringRef.current && !reducedMotion) {
      ringRef.current.rotation.z = t * 0.08;
    }
    const target = lit ? 1.18 : active ? 1 : 0.82;
    scaleTarget.current.set(target, target, target);
    group.scale.lerp(scaleTarget.current, 0.08);
  });

  const radius = base.size * 0.85;

  return (
    <group
      ref={groupRef}
      position={[base.x, base.y, base.z]}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(event) => {
        event.stopPropagation();
        setSelectedProjectId(selected ? null : project.id);
        const target =
          document.getElementById(`project-${project.id}`) ??
          document.getElementById('projects');
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }}
    >
      <mesh ref={planetRef}>
        <sphereGeometry args={[radius, 40, 40]} />
        <meshStandardMaterial
          map={maps.color}
          emissiveMap={maps.emissive}
          emissive={accent}
          emissiveIntensity={
            (lit ? 1.25 : 0.85) * mat.emissiveGain
          }
          roughness={mat.roughness}
          metalness={mat.metalness}
        />
      </mesh>

      <mesh scale={1.08}>
        <sphereGeometry args={[radius, 24, 24]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={lit ? 0.16 : 0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Style-specific ornaments */}
      {style === 'gasband' && (
        <mesh ref={ringRef} rotation={[Math.PI / 2.6, 0.2, 0]}>
          <torusGeometry args={[radius * 1.55, 0.045, 10, 80]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.45}
            metalness={0.6}
            roughness={0.35}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {style === 'gasband' && (
        <mesh rotation={[Math.PI / 2.6, 0.2, 0]}>
          <torusGeometry args={[radius * 1.85, 0.02, 8, 64]} />
          <meshBasicMaterial
            color="#fde68a"
            transparent
            opacity={lit ? 0.55 : 0.28}
          />
        </mesh>
      )}

      {style === 'volcanic' && (
        <mesh scale={1.18}>
          <icosahedronGeometry args={[radius, 1]} />
          <meshBasicMaterial
            color={accent}
            wireframe
            transparent
            opacity={lit ? 0.35 : 0.16}
          />
        </mesh>
      )}

      {style === 'cratered' && (
        <>
          <mesh position={[radius * 1.35, radius * 0.2, 0]}>
            <sphereGeometry args={[radius * 0.22, 16, 16]} />
            <meshStandardMaterial
              color="#78716c"
              roughness={0.9}
              metalness={0.15}
            />
          </mesh>
          <mesh position={[-radius * 1.15, -radius * 0.35, radius * 0.4]}>
            <sphereGeometry args={[radius * 0.12, 12, 12]} />
            <meshStandardMaterial
              color="#57534e"
              roughness={0.85}
              metalness={0.2}
            />
          </mesh>
        </>
      )}

      {style === 'storm' && (
        <mesh scale={1.22}>
          <octahedronGeometry args={[radius, 0]} />
          <meshBasicMaterial
            color={accent}
            wireframe
            transparent
            opacity={lit ? 0.42 : 0.2}
          />
        </mesh>
      )}

      {lit && (
        <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              padding: '0.45rem 0.7rem',
              border: `1px solid ${accent}99`,
              background: 'rgba(5,9,18,0.85)',
              color: '#fde68a',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '0.72rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              backdropFilter: 'blur(8px)',
            }}
          >
            {project.name}
          </div>
        </Html>
      )}
    </group>
  );
}
