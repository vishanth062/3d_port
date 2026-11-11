import { useEffect, useState } from 'react';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { JourneyHUD } from '@/components/common/JourneyHUD';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/navigation/Navbar';
import { About } from '@/sections/About/About';
import { Contact } from '@/sections/Contact/Contact';
import { Education } from '@/sections/Education/Education';
import { Experience } from '@/sections/Experience/Experience';
import { Foundations } from '@/sections/Foundations/Foundations';
import { Hero } from '@/sections/Hero/Hero';
import { Projects } from '@/sections/Projects/Projects';
import { Skills } from '@/sections/Skills/Skills';
import { ThreeScene } from '@/three/components/ThreeScene';
import { ScrollJourneyProvider } from '@/context/ScrollJourneyContext';

function AppShell() {
  const [ready, setReady] = useState(false);
  const [mountScene, setMountScene] = useState(false);

  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    // Paint UI first; mount WebGL when the browser is idle (or shortly after).
    const startScene = () => setMountScene(true);
    const ric = (
      window as Window & {
        requestIdleCallback?: (
          cb: () => void,
          opts?: { timeout: number },
        ) => number;
        cancelIdleCallback?: (id: number) => void;
      }
    ).requestIdleCallback;

    if (typeof ric === 'function') {
      idleId = ric(startScene, { timeout: 500 });
    } else {
      timeoutId = window.setTimeout(startScene, 180);
    }

    const readyTimer = window.setTimeout(() => {
      setReady(true);
    }, 900);

    return () => {
      const cic = (
        window as Window & { cancelIdleCallback?: (id: number) => void }
      ).cancelIdleCallback;
      if (idleId !== undefined && typeof cic === 'function') {
        cic(idleId);
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      window.clearTimeout(readyTimer);
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#about">
        Skip to content
      </a>
      <div className="grain" aria-hidden />
      <LoadingScreen ready={ready} />
      {mountScene ? <ThreeScene /> : null}
      <JourneyHUD />
      <div className="app-shell">
        <Navbar />
        <main>
          <Hero />
          <About />
          <Experience />
          <Projects />
          <Skills />
          <Education />
          <Foundations />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}

export function App() {
  return (
    <ScrollJourneyProvider>
      <AppShell />
    </ScrollJourneyProvider>
  );
}
