import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScrollJourney } from '@/context/ScrollJourneyContext';
import { createCircleTexture } from '@/three/utils/createCircleTexture';
import { createNebulaSprite } from '@/three/utils/createNebulaSprite';

interface ContactNebulaProps {
  reducedMotion: boolean;
}

/** Soft bokeh dust clustered on the right (leaves left UI readable). */
function buildDust(count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    // Bias to the right / mid depth around contact
    const rx = 0.35 + Math.pow(Math.random(), 0.7) * 0.65;
    const ry = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
    const rz = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
    // Local to ContactNebula group
    positions[i3] = rx * 16 - 1;
    positions[i3 + 1] = ry * 8;
    positions[i3 + 2] = rz * 14;

    const pink = Math.random() > 0.45;
    if (pink) {
      colors[i3] = 0.95;
      colors[i3 + 1] = 0.55 + Math.random() * 0.25;
      colors[i3 + 2] = 0.85 + Math.random() * 0.15;
    } else {
      const w = 0.85 + Math.random() * 0.15;
      colors[i3] = w;
      colors[i3 + 1] = w;
      colors[i3 + 2] = w;
    }
    sizes[i] = 0.35 + Math.random() * 1.4;
  }
  return { positions, colors, sizes };
}

function buildFineStars(count: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = -2 + Math.random() * 18;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
  }
  return positions;
}

const gasVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** Procedural wispy magenta/purple gas — no photo textures. */
const gasFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = m * p;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * 2.0;
    float dist = length(p);

    // Slow drifting filaments
    float t = uTime * 0.06;
    float n1 = fbm(uv * 3.2 + vec2(t * 0.4, -t * 0.25));
    float n2 = fbm(uv * 6.5 + vec2(-t * 0.3, t * 0.5) + n1);
    float n3 = fbm(uv * 11.0 - vec2(t, t * 0.2));

    float density = smoothstep(0.28, 0.78, n1 * 0.55 + n2 * 0.45);
    density *= smoothstep(1.15, 0.25, dist); // soft oval falloff
    density *= 0.65 + n3 * 0.55;

    vec3 col = mix(uColorA, uColorB, clamp(n2, 0.0, 1.0));
    col = mix(col, uColorC, smoothstep(0.45, 0.9, n1) * 0.65);

    // Hot pink peaks
    float peaks = pow(max(0.0, n2 - 0.55), 1.8);
    col += vec3(0.55, 0.2, 0.4) * peaks;

    float alpha = density * uOpacity;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

/**
 * Built nebula gas element for Contact — procedural shader clouds +
 * soft dust particles (no pasted reference images).
 */
export function ContactNebula({ reducedMotion }: ContactNebulaProps) {
  const groupRef = useRef<THREE.Group>(null);
  const dustRef = useRef<THREE.Points>(null);
  const sheetA = useRef<THREE.ShaderMaterial>(null);
  const sheetB = useRef<THREE.ShaderMaterial>(null);
  const sheetC = useRef<THREE.ShaderMaterial>(null);
  const { progress, beat, station } = useScrollJourney();

  const circleMap = useMemo(() => createCircleTexture(64), []);
  const wispViolet = useMemo(() => createNebulaSprite('violet', 512), []);
  const wispMagenta = useMemo(() => createNebulaSprite('magenta', 512), []);
  const dust = useMemo(() => buildDust(1600), []);
  const stars = useMemo(() => buildFineStars(220), []);

  const uniformsA = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0.55 },
      uColorA: { value: new THREE.Color('#2a1040') },
      uColorB: { value: new THREE.Color('#9d174d') },
      uColorC: { value: new THREE.Color('#e879f9') },
    }),
    [],
  );
  const uniformsB = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0.4 },
      uColorA: { value: new THREE.Color('#1e1035') },
      uColorB: { value: new THREE.Color('#7c3aed') },
      uColorC: { value: new THREE.Color('#f0abfc') },
    }),
    [],
  );
  const uniformsC = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0.35 },
      uColorA: { value: new THREE.Color('#3b0764') },
      uColorB: { value: new THREE.Color('#db2777') },
      uColorC: { value: new THREE.Color('#fda4af') },
    }),
    [],
  );

  const visible =
    station === 'contact' || beat === 'resolution' || progress > 0.8;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const fade = THREE.MathUtils.smoothstep(progress, 0.78, 0.92);

    if (sheetA.current) {
      sheetA.current.uniforms.uTime!.value = t;
      sheetA.current.uniforms.uOpacity!.value = 0.2 + fade * 0.5;
    }
    if (sheetB.current) {
      sheetB.current.uniforms.uTime!.value = t * 0.85 + 10;
      sheetB.current.uniforms.uOpacity!.value = 0.12 + fade * 0.4;
    }
    if (sheetC.current) {
      sheetC.current.uniforms.uTime!.value = t * 1.1 + 20;
      sheetC.current.uniforms.uOpacity!.value = 0.1 + fade * 0.35;
    }

    if (groupRef.current) {
      groupRef.current.visible = fade > 0.02;
      if (!reducedMotion) {
        groupRef.current.position.y = Math.sin(t * 0.15) * 0.25;
      }
    }

    if (dustRef.current) {
      const mat = dustRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.15 + fade * 0.7;
      if (!reducedMotion) {
        dustRef.current.rotation.y = Math.sin(t * 0.08) * 0.04;
      }
    }
  });

  return (
    <group ref={groupRef} visible={visible} position={[6, 1.6, -110]}>
      {/* Main procedural gas volumes — right-biased so text stays clear */}
      <mesh position={[2, 1, -4]} scale={[26, 16, 1]}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <shaderMaterial
          ref={sheetA}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={uniformsA}
          vertexShader={gasVertex}
          fragmentShader={gasFragment}
        />
      </mesh>
      <mesh
        position={[5, 0.2, -8]}
        rotation={[0.05, -0.2, 0.12]}
        scale={[22, 14, 1]}
      >
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={sheetB}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={uniformsB}
          vertexShader={gasVertex}
          fragmentShader={gasFragment}
        />
      </mesh>
      <mesh
        position={[-1, 2.5, -12]}
        rotation={[-0.08, 0.25, -0.1]}
        scale={[20, 12, 1]}
      >
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={sheetC}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={uniformsC}
          vertexShader={gasVertex}
          fragmentShader={gasFragment}
        />
      </mesh>

      {/* Extra soft sprite wisps for depth */}
      <mesh position={[4, -1, -2]} scale={[14, 10, 1]} rotation={[0, 0.1, 0.2]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={wispMagenta}
          transparent
          opacity={0.45}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[8, 2.5, -6]} scale={[12, 9, 1]} rotation={[0.1, -0.2, -0.15]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={wispViolet}
          transparent
          opacity={0.4}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[1, 3, -10]} scale={[11, 8, 1]} rotation={[-0.1, 0.3, 0.1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={wispViolet}
          transparent
          opacity={0.32}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Soft glowing dust / bokeh */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[dust.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[dust.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          map={circleMap}
          size={0.95}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Fine stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[stars, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={circleMap}
          size={0.08}
          sizeAttenuation
          color="#ffe4f3"
          transparent
          opacity={0.85}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <pointLight color="#e879f9" intensity={2.6} distance={36} position={[3, 2, 2]} />
      <pointLight color="#9d174d" intensity={1.8} distance={30} position={[8, 0, -4]} />
      <pointLight color="#7c3aed" intensity={1.5} distance={28} position={[-2, 3, -6]} />
    </group>
  );
}
