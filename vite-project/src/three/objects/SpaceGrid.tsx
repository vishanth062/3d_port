import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollJourney } from '@/context/ScrollJourneyContext';

interface SpaceGridProps {
  reducedMotion: boolean;
}

const GRID_WARM = new THREE.Color('#f5e6c4');
const GRID_COOL = new THREE.Color('#7dd3fc');

/**
 * Wireframe terrain grid with left→right traveling waves + side ridges
 * (Atelier Virtual Economy style).
 */
export function SpaceGrid({ reducedMotion }: SpaceGridProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { progress, station } = useScrollJourney();

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(90, 160, 70, 100);
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color('#f5e6c4') },
      uFade: { value: 0.78 },
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (reducedMotion) return;
    const t = clock.elapsedTime;
    const mat = materialRef.current;
    const uTime = mat?.uniforms.uTime;
    if (uTime) uTime.value = t;
    // Cool blue grid through education / late climax (reference look)
    if (mat?.uniforms.uColor) {
      const cool =
        station === 'education'
          ? 1
          : THREE.MathUtils.smoothstep(progress, 0.7, 0.88);
      (mat.uniforms.uColor.value as THREE.Color).copy(GRID_WARM).lerp(GRID_COOL, cool);
    }
    if (meshRef.current) {
      // Scroll the plane forward so the voyage feels continuous
      meshRef.current.position.z = -35 + ((t * 3.5) % 8);
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -3.6, -35]} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        wireframe
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          varying float vElevation;
          varying vec2 vUv;

          void main() {
            vUv = uv;
            vec3 pos = position;

            // Traveling waves left → right (along world X after rotation)
            float waveA = sin(pos.x * 0.22 + uTime * 1.35) * 0.55;
            float waveB = sin(pos.x * 0.11 - uTime * 0.85 + pos.z * 0.05) * 0.9;
            float waveC = sin(pos.x * 0.38 + uTime * 2.1 + pos.z * 0.08) * 0.22;

            // Mountain ridges on the sides (reference look)
            float side = smoothstep(12.0, 38.0, abs(pos.x));
            float ridge =
              side *
              (1.4 + sin(pos.z * 0.18) * 0.8 + sin(pos.x * 0.35 + pos.z * 0.1) * 0.6) *
              2.4;

            pos.y += waveA + waveB + waveC + ridge;
            vElevation = pos.y;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform float uFade;
          varying float vElevation;
          varying vec2 vUv;

          void main() {
            float fadeZ = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
            float heightGlow = smoothstep(-0.2, 3.5, vElevation);
            float alpha = fadeZ * uFade * (0.35 + heightGlow * 0.65);
            vec3 col = mix(uColor, vec3(1.0, 0.82, 0.42), heightGlow * 0.45);
            gl_FragColor = vec4(col, alpha);
          }
        `}
      />
    </mesh>
  );
}
