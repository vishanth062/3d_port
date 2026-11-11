import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { JourneyStation } from '@/context/ScrollJourneyContext';
import { useScrollJourney } from '@/context/ScrollJourneyContext';

interface StationBeaconProps {
  id: JourneyStation;
  label: string;
  position: [number, number, number];
  reducedMotion: boolean;
}

/** Station markers (Experience is a dedicated huge Saturn elsewhere). */
export function StationBeacon({
  id,
  label,
  position,
  reducedMotion,
}: StationBeaconProps) {
  const spinRef = useRef<THREE.Group>(null);
  const { station } = useScrollJourney();
  const active = station === id;

  useFrame((_, delta) => {
    if (!spinRef.current || reducedMotion) return;
    spinRef.current.rotation.y += delta * (active ? 0.7 : 0.25);
  });

  return (
    <group position={position}>
      <group ref={spinRef}>
        {id === 'about' && (
          <>
            <mesh>
              <octahedronGeometry args={[0.45, 0]} />
              <meshStandardMaterial
                color="#0b1020"
                emissive={active ? '#f9a8d4' : '#c4b5fd'}
                emissiveIntensity={active ? 0.9 : 0.4}
                metalness={0.6}
                roughness={0.25}
              />
            </mesh>
            <mesh>
              <octahedronGeometry args={[0.55, 0]} />
              <meshBasicMaterial
                color="#f9a8d4"
                wireframe
                transparent
                opacity={active ? 0.7 : 0.3}
              />
            </mesh>
          </>
        )}

        {id === 'projects' && (
          <>
            <mesh>
              <icosahedronGeometry args={[0.42, 1]} />
              <meshBasicMaterial
                color={active ? '#7CE6D2' : '#94a3b8'}
                wireframe
                transparent
                opacity={active ? 0.85 : 0.4}
              />
            </mesh>
            <mesh>
              <boxGeometry args={[0.35, 0.35, 0.35]} />
              <meshStandardMaterial
                color="#111827"
                emissive="#7CE6D2"
                emissiveIntensity={active ? 0.8 : 0.3}
              />
            </mesh>
          </>
        )}

        {id === 'skills' && (
          <>
            {/* Antenna array / tower */}
            <mesh>
              <cylinderGeometry args={[0.06, 0.1, 1.1, 6]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.25} />
            </mesh>
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[0.55, 0.04, 0.2]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#0ea5e9"
                emissiveIntensity={active ? 0.8 : 0.35}
              />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.4, 0.04, 0.16]} />
              <meshStandardMaterial
                color="#a5b4fc"
                emissive="#818cf8"
                emissiveIntensity={active ? 0.7 : 0.3}
              />
            </mesh>
          </>
        )}

        {id === 'contact' && (
          <>
            {/* Signal diamond + beam stub */}
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.55, 0.55, 0.12]} />
              <meshStandardMaterial
                color="#0b1020"
                emissive={active ? '#fde68a' : '#fdba74'}
                emissiveIntensity={active ? 0.95 : 0.4}
                metalness={0.5}
                roughness={0.3}
              />
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.7, 4]} />
              <meshBasicMaterial color="#fde68a" />
            </mesh>
          </>
        )}

        {id === 'hero' && null}
      </group>

      {active && (
        <Html center distanceFactor={12} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              marginTop: '2.6rem',
              color: '#e2e8f0',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '0.68rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              opacity: 0.95,
              whiteSpace: 'nowrap',
              textShadow: '0 0 12px rgba(0,0,0,0.85)',
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}
