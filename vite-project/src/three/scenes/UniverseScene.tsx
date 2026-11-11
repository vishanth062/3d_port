import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents, Preload } from '@react-three/drei';
import { Starfield } from '@/three/objects/Starfield';
import { OrbitalCore } from '@/three/objects/OrbitalCore';
import { SpaceGrid } from '@/three/objects/SpaceGrid';
import { SpaceProps } from '@/three/objects/SpaceProps';
import { ProjectPlanet } from '@/three/objects/ProjectPlanet';
import { StationBeacon } from '@/three/objects/StationBeacon';
import { ExperienceSaturn } from '@/three/objects/ExperienceSaturn';
import { EducationArmillary } from '@/three/objects/EducationArmillary';
import { ShootingStars } from '@/three/objects/ShootingStars';
import { Spacecraft } from '@/three/objects/Spacecraft';
import { MilkyWay } from '@/three/objects/MilkyWay';
import { NebulaFields } from '@/three/objects/NebulaFields';
import { ContactNebula } from '@/three/objects/ContactNebula';
import { StoryLights } from '@/three/objects/StoryLights';
import { ScrollCameraRig } from '@/three/camera/ScrollCameraRig';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { dprForTier, getDeviceTier } from '@/three/utils/performance';
import { projects } from '@/data/projects';

function SceneContents() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <>
      <color attach="background" args={['#050912']} />
      <fog attach="fog" args={['#050912', 28, 110]} />
      <StoryLights />

      <ScrollCameraRig reducedMotion={reducedMotion} />
      <Starfield reducedMotion={reducedMotion} />
      <MilkyWay reducedMotion={reducedMotion} />
      <NebulaFields reducedMotion={reducedMotion} />
      <ContactNebula reducedMotion={reducedMotion} />
      <SpaceGrid reducedMotion={reducedMotion} />
      <SpaceProps reducedMotion={reducedMotion} />
      <ShootingStars reducedMotion={reducedMotion} />
      <Spacecraft reducedMotion={reducedMotion} />
      <OrbitalCore reducedMotion={reducedMotion} />
      <ExperienceSaturn reducedMotion={reducedMotion} />
      <EducationArmillary reducedMotion={reducedMotion} />

      <StationBeacon
        id="about"
        label="About"
        position={[-2.2, 0.8, -12]}
        reducedMotion={reducedMotion}
      />
      <StationBeacon
        id="projects"
        label="Projects"
        position={[0, 2.2, -44]}
        reducedMotion={reducedMotion}
      />
      <StationBeacon
        id="skills"
        label="Skills"
        position={[-2.6, 1.1, -64]}
        reducedMotion={reducedMotion}
      />
      <StationBeacon
        id="contact"
        label="Contact"
        position={[0.4, 1.4, -98]}
        reducedMotion={reducedMotion}
      />

      {projects.map((project, index) => (
        <ProjectPlanet
          key={project.id}
          project={project}
          index={index}
          reducedMotion={reducedMotion}
        />
      ))}

      <Preload all />
    </>
  );
}

export function UniverseScene() {
  const tier = useMemo(() => getDeviceTier(), []);
  const dpr = useMemo(() => dprForTier(tier), [tier]);
  const antialias = tier !== 'low';

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0.2, 1.9, 9.5], fov: 40, near: 0.1, far: 180 }}
      gl={{
        antialias,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      style={{ width: '100%', height: '100%' }}
      aria-hidden
    >
      <Suspense fallback={null}>
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <SceneContents />
      </Suspense>
    </Canvas>
  );
}
