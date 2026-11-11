import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollJourney } from '@/context/ScrollJourneyContext';
import {
  flybyAmount,
  isCraftFlyby,
} from '@/three/story/storyBeats';

interface SpacecraftProps {
  reducedMotion: boolean;
}

/** Default escort path (off to the side of the camera). */
const PATH: [number, number, number][] = [
  [5.2, 1.6, 8],
  [4.4, 1.2, -4],
  [3.2, 2.0, -18],
  [-1.2, 2.8, -38],
  [-3.4, 1.8, -56],
  [2.0, 2.4, -74],
  [0.6, 1.6, -90],
];

const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _local = new THREE.Vector3();
const _world = new THREE.Vector3();
const _axisX = new THREE.Vector3();
const _axisY = new THREE.Vector3();
const _axisZ = new THREE.Vector3();
const _vel = new THREE.Vector3();
const _basis = new THREE.Matrix4();
const _quat = new THREE.Quaternion();

const HULL = '#2a1848';
const HULL_DEEP = '#1a0f2e';
const GOLD = '#d4a017';
const GOLD_BRIGHT = '#f5d76e';
const BRONZE = '#b8860b';

function sample(
  points: THREE.Vector3[],
  progress: number,
  target: THREE.Vector3,
) {
  if (points.length === 0) return;
  const max = points.length - 1;
  const scaled = Math.min(1, Math.max(0, progress)) * max;
  const i = Math.min(max - 1, Math.floor(scaled));
  const t = scaled - i;
  const a = points[i] as THREE.Vector3;
  const b = (points[i + 1] ?? a) as THREE.Vector3;
  target.copy(a).lerp(b, t * t * (3 - 2 * t));
}

function HullMaterial({
  color = HULL,
  metalness = 0.85,
  roughness = 0.28,
  emissive = '#4c1d95',
  emissiveIntensity = 0.15,
}: {
  color?: string;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
    />
  );
}

function GoldMaterial({ bright = false }: { bright?: boolean }) {
  return (
    <meshStandardMaterial
      color={bright ? GOLD_BRIGHT : GOLD}
      metalness={0.95}
      roughness={0.18}
      emissive={bright ? '#a16207' : '#78350f'}
      emissiveIntensity={0.2}
    />
  );
}

function CoreCrystal({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) return;
    const t = clock.elapsedTime;
    groupRef.current.rotation.z = t * 1.6;
    groupRef.current.rotation.y = Math.sin(t * 0.8) * 0.25;
    if (innerRef.current) {
      const pulse = 0.9 + Math.sin(t * 3.5) * 0.12;
      innerRef.current.scale.set(pulse, pulse * 1.15, pulse);
    }
  });

  return (
    <group position={[0, 0.08, 0.05]}>
      {/* Gold coil / ribcage frame */}
      {[0.35, 0, -0.35].map((z, i) => (
        <mesh key={i} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.38, 0.018, 10, 40]} />
          <GoldMaterial bright={i === 1} />
        </mesh>
      ))}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.32, 0.012, 8, 32]} />
        <GoldMaterial />
      </mesh>

      {/* Spinning purple crystal core */}
      <group ref={groupRef}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.14, 0.38, 6, 12]} />
          <meshStandardMaterial
            color="#6d28d9"
            emissive="#a855f7"
            emissiveIntensity={1.35}
            metalness={0.25}
            roughness={0.1}
            transparent
            opacity={0.92}
          />
        </mesh>
        <mesh ref={innerRef}>
          <octahedronGeometry args={[0.16, 0]} />
          <meshBasicMaterial
            color="#e9d5ff"
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh scale={1.15}>
          <octahedronGeometry args={[0.16, 0]} />
          <meshBasicMaterial color="#c4b5fd" wireframe transparent opacity={0.45} />
        </mesh>
      </group>

      <pointLight color="#c084fc" intensity={3.2} distance={5} />
      <pointLight color="#f5d76e" intensity={0.6} distance={3} position={[0.4, 0.2, 0]} />
    </group>
  );
}

/**
 * Luxury biomechanical craft — deep purple hull, gold plating,
 * open midsection with spinning purple crystal core.
 */
export function Spacecraft({ reducedMotion }: SpacecraftProps) {
  const { progress, beat } = useScrollJourney();
  const groupRef = useRef<THREE.Group>(null);
  const pos = useRef(new THREE.Vector3());
  const next = useRef(new THREE.Vector3());
  const scaleTarget = useRef(new THREE.Vector3(1.05, 1.05, 1.05));
  const path = useMemo(() => PATH.map((p) => new THREE.Vector3(...p)), []);

  const visible = progress > 0.05;

  useFrame(({ camera, clock }) => {
    const group = groupRef.current;
    if (!group) return;
    group.visible = visible;
    if (!visible) return;

    const flyby = isCraftFlyby(progress);
    const flybyT = flybyAmount(progress);

    if (flyby) {
      // Phases: arc R→L → spin 90° → drift forward
      const ARC_END = 0.5;
      const SPIN_END = 0.68;

      camera.getWorldDirection(_forward);
      _right.crossVectors(_forward, camera.up).normalize();
      _up.crossVectors(_right, _forward).normalize();

      const leftAcross = -5.6;
      const leftDepth = -5.4;
      const leftLift = -0.35;

      let across: number;
      let depth: number;
      let lift: number;
      let bank = 0;
      let focus = 0;

      if (flybyT <= ARC_END) {
        const t = flybyT / ARC_END;
        const turn = t * Math.PI;
        const ease = t * t * (3 - 2 * t);

        across = Math.cos(turn) * 5.6;
        depth = -5.4 + Math.sin(turn) * 2.1;
        lift = -0.35 + Math.sin(turn) * 0.85 + Math.sin(ease * Math.PI) * 0.15;
        bank = Math.sin(turn) * 0.55;
        focus = Math.sin(turn);

        const dAcross = -Math.sin(turn) * Math.PI * 5.6;
        const dDepth = Math.cos(turn) * Math.PI * 2.1;
        const dLift = Math.cos(turn) * Math.PI * 0.85;
        _vel
          .set(0, 0, 0)
          .addScaledVector(_right, dAcross)
          .addScaledVector(_up, dLift)
          .addScaledVector(_forward, dDepth)
          .normalize();
        // Near arrival, settle nose left across the screen
        _axisX.copy(_right).negate();
        _axisZ.lerpVectors(_vel, _axisX, t * t).normalize();
      } else if (flybyT <= SPIN_END) {
        const spinT = (flybyT - ARC_END) / (SPIN_END - ARC_END);
        const spinEase = spinT * spinT * (3 - 2 * spinT);

        across = leftAcross;
        depth = leftDepth;
        lift = leftLift;
        bank = 0;
        focus = 0.85;

        // 90° body spin: nose left (-right) → nose into scene (+forward)
        _axisZ
          .copy(_right)
          .negate()
          .lerp(_forward, spinEase)
          .normalize();
      } else {
        const driftT = (flybyT - SPIN_END) / (1 - SPIN_END);
        const driftEase = driftT * driftT * (3 - 2 * driftT);

        across = leftAcross + driftEase * 0.4;
        lift = leftLift + Math.sin(driftEase * Math.PI) * 0.12;
        // Drift forward along the look direction
        depth = leftDepth + driftEase * 6.2;
        bank = 0;
        focus = 0.75 - driftEase * 0.25;

        _axisZ.copy(_forward);
      }

      _local
        .set(0, 0, 0)
        .addScaledVector(_right, across)
        .addScaledVector(_up, lift)
        .addScaledVector(_forward, depth);

      _world.copy(camera.position).add(_local);
      pos.current.copy(_world);
      group.position.lerp(pos.current, flybyT > ARC_END ? 0.1 : 0.14);

      _axisX.copy(_forward).negate();
      _axisY.crossVectors(_axisZ, _axisX).normalize();
      _axisX.crossVectors(_axisY, _axisZ).normalize();
      if (bank !== 0) {
        _axisX.applyAxisAngle(_axisZ, bank);
        _axisY.crossVectors(_axisZ, _axisX).normalize();
      }
      _basis.makeBasis(_axisX, _axisY, _axisZ);
      _quat.setFromRotationMatrix(_basis);
      group.quaternion.slerp(_quat, flybyT > ARC_END && flybyT <= SPIN_END ? 0.22 : 0.14);

      const targetScale = 1.15 + focus * 0.55;
      scaleTarget.current.set(targetScale, targetScale, targetScale);
      group.scale.lerp(scaleTarget.current, 0.1);
    } else {
      const lead = Math.min(1, progress + 0.05);
      sample(path, lead, pos.current);
      sample(path, Math.min(1, lead + 0.035), next.current);

      if (!reducedMotion) {
        pos.current.y += Math.sin(clock.elapsedTime * 1.15) * 0.08;
        pos.current.x += Math.cos(clock.elapsedTime * 0.8) * 0.05;
      }

      group.position.lerp(pos.current, 0.07);
      group.lookAt(next.current);
      group.rotateY(Math.PI);
      scaleTarget.current.set(1.05, 1.05, 1.05);
      group.scale.lerp(scaleTarget.current, 0.08);
    }
  });

  return (
    <group ref={groupRef} scale={1.05}>
      {/* ===== NOSE ===== */}
      <mesh position={[0, 0.05, 1.35]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.22, 0.7, 12]} />
        <HullMaterial />
      </mesh>
      <mesh position={[0, 0.05, 1.05]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.32, 0.35, 12]} />
        <HullMaterial color={HULL_DEEP} />
      </mesh>
      {/* Gold nose trim */}
      <mesh position={[0, 0.05, 1.22]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.02, 8, 24]} />
        <GoldMaterial bright />
      </mesh>

      {/* ===== FORWARD HULL ===== */}
      <mesh position={[0, 0.08, 0.65]}>
        <capsuleGeometry args={[0.34, 0.55, 6, 14]} />
        <HullMaterial />
      </mesh>
      {/* Dorsal gold spine */}
      <mesh position={[0, 0.42, 0.55]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.12, 0.06, 0.7]} />
        <GoldMaterial />
      </mesh>
      <mesh position={[0, 0.48, 0.35]}>
        <boxGeometry args={[0.18, 0.1, 0.22]} />
        <GoldMaterial bright />
      </mesh>
      {/* Antenna */}
      <mesh position={[0.05, 0.62, 0.3]}>
        <cylinderGeometry args={[0.01, 0.01, 0.35, 6]} />
        <GoldMaterial />
      </mesh>
      <mesh position={[-0.04, 0.58, 0.38]}>
        <cylinderGeometry args={[0.008, 0.008, 0.28, 6]} />
        <meshStandardMaterial color={BRONZE} metalness={0.9} roughness={0.25} />
      </mesh>

      {/* ===== OPEN MIDSECTION (ribs around crystal) ===== */}
      <CoreCrystal reducedMotion={reducedMotion} />

      {/* Side rails framing the core */}
      <mesh position={[0.42, 0.08, 0]}>
        <capsuleGeometry args={[0.08, 0.7, 4, 10]} />
        <HullMaterial color={HULL_DEEP} />
      </mesh>
      <mesh position={[-0.42, 0.08, 0]}>
        <capsuleGeometry args={[0.08, 0.7, 4, 10]} />
        <HullMaterial color={HULL_DEEP} />
      </mesh>
      {/* Gold rib arches */}
      {[-0.25, 0, 0.25].map((z, i) => (
        <group key={i} position={[0, 0.08, z]}>
          <mesh position={[0.28, 0.22, 0]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.06, 0.35, 0.04]} />
            <GoldMaterial />
          </mesh>
          <mesh position={[-0.28, 0.22, 0]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.06, 0.35, 0.04]} />
            <GoldMaterial />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <boxGeometry args={[0.55, 0.05, 0.04]} />
            <GoldMaterial bright={i === 1} />
          </mesh>
        </group>
      ))}

      {/* ===== AFT HULL ===== */}
      <mesh position={[0, 0.06, -0.75]}>
        <capsuleGeometry args={[0.36, 0.5, 6, 14]} />
        <HullMaterial />
      </mesh>
      <mesh position={[0, 0.05, -1.25]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.36, 0.2, 0.55, 12]} />
        <HullMaterial color={HULL_DEEP} />
      </mesh>
      {/* Gold aft band */}
      <mesh position={[0, 0.05, -1.0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.025, 8, 28]} />
        <GoldMaterial bright />
      </mesh>

      {/* ===== SWEPT WINGS ===== */}
      <mesh position={[0.7, 0.02, -0.35]} rotation={[0.1, 0.35, 0.45]}>
        <boxGeometry args={[0.9, 0.05, 0.35]} />
        <HullMaterial />
      </mesh>
      <mesh position={[-0.7, 0.02, -0.35]} rotation={[0.1, -0.35, -0.45]}>
        <boxGeometry args={[0.9, 0.05, 0.35]} />
        <HullMaterial />
      </mesh>
      {/* Gold wing edges */}
      <mesh position={[0.95, 0.04, -0.45]} rotation={[0.1, 0.35, 0.45]}>
        <boxGeometry args={[0.55, 0.03, 0.08]} />
        <GoldMaterial />
      </mesh>
      <mesh position={[-0.95, 0.04, -0.45]} rotation={[0.1, -0.35, -0.45]}>
        <boxGeometry args={[0.55, 0.03, 0.08]} />
        <GoldMaterial />
      </mesh>

      {/* Lower fins */}
      <mesh position={[0.35, -0.28, -0.5]} rotation={[0.3, 0.2, 0.5]}>
        <boxGeometry args={[0.45, 0.04, 0.25]} />
        <HullMaterial color={HULL_DEEP} />
      </mesh>
      <mesh position={[-0.35, -0.28, -0.5]} rotation={[0.3, -0.2, -0.5]}>
        <boxGeometry args={[0.45, 0.04, 0.25]} />
        <HullMaterial color={HULL_DEEP} />
      </mesh>

      {/* ===== SIDE THRUSTER PODS ===== */}
      {[
        [0.55, -0.05, -0.85],
        [-0.55, -0.05, -0.85],
        [0.7, 0.1, -0.15],
        [-0.7, 0.1, -0.15],
      ].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 0.28, 10]} />
            <meshStandardMaterial
              color={BRONZE}
              metalness={0.9}
              roughness={0.22}
              emissive="#78350f"
              emissiveIntensity={0.15}
            />
          </mesh>
          <mesh position={[0, 0, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.08, 10]} />
            <meshStandardMaterial
              color="#1a0f2e"
              emissive="#a855f7"
              emissiveIntensity={beat === 'climax' ? 1.2 : 0.6}
            />
          </mesh>
        </group>
      ))}

      {/* Trailing sensor orbs */}
      <mesh position={[0.85, -0.15, -1.35]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial
          color={GOLD}
          metalness={0.9}
          roughness={0.2}
          emissive="#a855f7"
          emissiveIntensity={0.35}
        />
      </mesh>
      <mesh position={[-0.8, -0.1, -1.4]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial
          color={BRONZE}
          metalness={0.9}
          roughness={0.2}
          emissive="#7c3aed"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Soft hull lights */}
      <pointLight
        position={[0, 0.3, 0.8]}
        color="#a78bfa"
        intensity={0.8}
        distance={3}
      />
      <pointLight
        position={[0, 0, -1.2]}
        color="#c084fc"
        intensity={beat === 'climax' ? 1.8 : 1.0}
        distance={4}
      />
    </group>
  );
}
