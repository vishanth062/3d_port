import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { AmbientLight, Fog, PointLight } from 'three';
import { useScrollJourney } from '@/context/ScrollJourneyContext';
import { beatIntensity } from '@/three/story/storyBeats';

export function StoryLights() {
  const { progress, beat } = useScrollJourney();
  const ambientRef = useRef<AmbientLight>(null);
  const roseRef = useRef<PointLight>(null);
  const amberRef = useRef<PointLight>(null);
  const violetRef = useRef<PointLight>(null);
  const tealRef = useRef<PointLight>(null);

  useFrame(({ scene }) => {
    const intensity = beatIntensity(progress, beat);
    const fog = scene.fog as Fog | null;

    if (ambientRef.current) {
      ambientRef.current.intensity =
        beat === 'climax'
          ? 0.7
          : beat === 'flyby'
            ? 0.62
            : beat === 'intro'
              ? 0.48
              : 0.55;
      ambientRef.current.color.set(
        beat === 'intro'
          ? '#e8eef5'
          : beat === 'flyby'
            ? '#efe6ff'
            : beat === 'climax'
              ? '#f5e6ff'
              : beat === 'resolution'
                ? '#ffe8d6'
                : '#d7e3ef',
      );
    }

    if (roseRef.current) {
      roseRef.current.intensity =
        (beat === 'rising' || beat === 'climax' || beat === 'flyby'
          ? 2.4
          : 0.55) * intensity;
      roseRef.current.position.set(-6, 3, -20 - progress * 55);
    }
    if (amberRef.current) {
      amberRef.current.intensity =
        (beat === 'intro'
          ? 2.6
          : beat === 'climax'
            ? 2.8
            : beat === 'resolution'
              ? 1.8
              : 1.1) * intensity;
      amberRef.current.position.set(
        beat === 'intro' ? 4 : 5,
        beat === 'intro' ? 3 : 4,
        beat === 'intro' ? 4 : -45 - progress * 30,
      );
    }
    if (violetRef.current) {
      violetRef.current.intensity =
        (beat === 'climax' ? 2.2 : beat === 'resolution' ? 2.0 : 0.8) *
        intensity;
      violetRef.current.position.set(
        2,
        2,
        beat === 'resolution' ? -100 : -60,
      );
    }
    if (tealRef.current) {
      tealRef.current.intensity =
        (beat === 'intro' ? 1.4 : beat === 'resolution' ? 2.2 : 1.1) *
        intensity;
      if (beat === 'resolution') {
        tealRef.current.position.set(-6, 6, -105);
        tealRef.current.color.set('#5eead4');
      }
    }

    if (fog) {
      if (beat === 'resolution') {
        fog.near = 35;
        fog.far = 170;
        fog.color.set('#07051a');
      } else if (beat === 'climax') {
        fog.near = 18;
        fog.far = 95;
        fog.color.set('#050912');
      } else {
        fog.near = 22;
        fog.far = 82;
        fog.color.set('#050912');
      }
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.5} color="#d7e3ef" />
      <pointLight
        ref={tealRef}
        position={[8, 10, 12]}
        intensity={1.8}
        color="#7CE6D2"
        distance={60}
      />
      <pointLight
        ref={roseRef}
        position={[-6, 3, -20]}
        intensity={1.2}
        color="#f9a8d4"
        distance={55}
      />
      <pointLight
        ref={amberRef}
        position={[5, 4, -48]}
        intensity={1.2}
        color="#fdba74"
        distance={50}
      />
      <pointLight
        ref={violetRef}
        position={[2, 2, -60]}
        intensity={1.1}
        color="#c4b5fd"
        distance={45}
      />
    </>
  );
}
