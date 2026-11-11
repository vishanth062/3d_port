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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReady(true);
    }, 900);
    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#about">
        Skip to content
      </a>
      <div className="grain" aria-hidden />
      <LoadingScreen ready={ready} />
      <ThreeScene />
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
