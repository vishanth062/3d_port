import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollJourney } from '@/context/ScrollJourneyContext';
import { flybyAmount, isCraftFlyby } from '@/three/story/storyBeats';

interface ScrollCameraRigProps {
  reducedMotion: boolean;
}

/**
 * Journey path — craft flyby, then under-Saturn ring pass (left side),
 * never into the planet core.
 */
const WAYPOINTS: [number, number, number][] = [
  [0.2, 1.9, 9.5],
  [1.5, 1.7, 2],
  [0.0, 1.55, -10], // craft flyby hold
  [0.0, 1.55, -14], // craft flyby linger
  [-5.8, -0.6, -24], // peel left + drop under Saturn approach
  [-8.2, -2.4, -36], // under the rings (side pass)
  [-4.5, -1.0, -48], // clear past Saturn underside
  [2.2, 1.4, -58], // projects corridor
  [-2.8, 2.4, -66], // skills approach
  [-1.6, 2.2, -74], // education — frame armillary on the right
  [0.8, 1.8, -88], // contact approach
  [-0.4, 2.0, -104],
];

const LOOK_AT: [number, number, number][] = [
  [1.6, 0.25, 0.4], // prologue planet
  [1.0, 0.6, -8],
  [0.0, 1.35, -18], // craft flyby
  [0.0, 1.3, -22],
  [8.5, 2.4, -42], // glance Saturn from below-left
  [12.0, 3.0, -46], // track along rings while under
  [4.0, 1.0, -58], // look ahead past Saturn
  [0.6, 0.8, -68],
  [4.4, 1.9, -80], // education armillary
  [0.6, 1.2, -96],
  [0.1, 0.9, -110],
];

const FLYBY_CAM = new THREE.Vector3(0, 1.55, -11);
const FLYBY_LOOK = new THREE.Vector3(0, 1.35, -20);

function samplePath(
  points: THREE.Vector3[],
  progress: number,
  target: THREE.Vector3,
) {
  if (points.length === 0) return;
  const max = points.length - 1;
  const scaled = progress * max;
  const i = Math.min(max - 1, Math.floor(scaled));
  const t = scaled - i;
  const smooth = t * t * (3 - 2 * t);
  const a = points[i] as THREE.Vector3;
  const b = (points[i + 1] ?? a) as THREE.Vector3;
  target.copy(a).lerp(b, smooth);
}

export function ScrollCameraRig({ reducedMotion }: ScrollCameraRigProps) {
  const { camera, pointer } = useThree();
  const { progress } = useScrollJourney();
  const desired = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3(1.6, 0.3, 0));
  const bank = useRef(0);

  const path = useMemo(
    () => WAYPOINTS.map((p) => new THREE.Vector3(...p)),
    [],
  );
  const looks = useMemo(
    () => LOOK_AT.map((p) => new THREE.Vector3(...p)),
    [],
  );

  useFrame(() => {
    if (reducedMotion) {
      camera.position.set(0, 1.9, 9.5);
      camera.lookAt(1.6, 0.25, 0.4);
      camera.rotation.z = 0;
      return;
    }

    samplePath(path, progress, desired.current);
    samplePath(looks, progress, look.current);

    const flyby = isCraftFlyby(progress);
    const flybyT = flybyAmount(progress);
    // Soft hold: blend camera toward a centered flyby frame
    if (flyby) {
      const hold = Math.sin(flybyT * Math.PI); // peak in the middle of the beat
      desired.current.lerp(FLYBY_CAM, 0.55 + hold * 0.4);
      look.current.lerp(FLYBY_LOOK, 0.55 + hold * 0.4);
      // Kill most mouse drift so the craft stays framed
      desired.current.x += pointer.x * 0.25;
      desired.current.y += pointer.y * 0.15;
      look.current.x += pointer.x * 0.15;
      look.current.y += pointer.y * 0.1;
    } else {
      desired.current.x += pointer.x * 1.4;
      desired.current.y += pointer.y * 0.7;
      look.current.x += pointer.x * 0.6;
      look.current.y += pointer.y * 0.35;
    }

    camera.position.lerp(desired.current, flyby ? 0.08 : 0.055);
    currentLook.current.lerp(look.current, flyby ? 0.08 : 0.055);
    camera.lookAt(currentLook.current);

    const targetBank = flyby
      ? 0
      : THREE.MathUtils.clamp(
          -desired.current.x * 0.035 + pointer.x * 0.04,
          -0.18,
          0.18,
        );
    bank.current = THREE.MathUtils.lerp(bank.current, targetBank, 0.06);
    camera.rotation.z = bank.current;
  });

  return null;
}
