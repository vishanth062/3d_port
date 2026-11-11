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
 * Wireframe terrain grid with left→right traveling waves + side ridges.
 * Scroll is phase-shifted in the shader (no mesh modulo jump).
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
      uScroll: { value: 0 },
      uColor: { value: new THREE.Color('#f5e6c4') },
      uFade: { value: 0.78 },
    }),
    [],
  );

  useFrame(({ clock }, delta) => {
    if (reducedMotion) return;
    const mat = materialRef.current;
    if (!mat) return;

    const t = clock.elapsedTime;
    mat.uniforms.uTime.value = t;
    // Continuous forward scroll — never wraps / snaps
    mat.uniforms.uScroll.value += delta * 3.5;

    const cool =
      station === 'education'
        ? 1
        : THREE.MathUtils.smoothstep(progress, 0.7, 0.88);
    (mat.uniforms.uColor.value as THREE.Color).copy(GRID_WARM).lerp(GRID_COOL, cool);
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
          uniform float uScroll;
          varying float vElevation;
          varying vec2 vUv;

          void main() {
            vUv = uv;
            vec3 pos = position;

            // Endless terrain phase along Z (continuous, no reset)
            float zx = pos.z + uScroll;

            // Traveling waves left → right (along world X after rotation)
            float waveA = sin(pos.x * 0.22 + uTime * 1.35) * 0.55;
            float waveB = sin(pos.x * 0.11 - uTime * 0.85 + zx * 0.05) * 0.9;
            float waveC = sin(pos.x * 0.38 + uTime * 2.1 + zx * 0.08) * 0.22;

            // Mountain ridges on the sides — also scroll continuously
            float side = smoothstep(12.0, 38.0, abs(pos.x));
            float ridge =
              side *
              (1.4 + sin(zx * 0.18) * 0.8 + sin(pos.x * 0.35 + zx * 0.1) * 0.6) *
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
