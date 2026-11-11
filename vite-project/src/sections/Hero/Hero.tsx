import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Button } from '@/components/common/Button';
import { profile } from '@/data/profile';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import styles from './Hero.module.css';

export function Hero() {
  const contentRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const targets = el.querySelectorAll<HTMLElement>('[data-animate]');

    if (reducedMotion) {
      targets.forEach((node) => {
        node.style.opacity = '1';
        node.style.transform = 'none';
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y: 28 });
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 1.05,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.35,
        clearProps: 'transform',
      });
    }, el);

    return () => {
      ctx.revert();
      targets.forEach((node) => {
        node.style.opacity = '1';
        node.style.transform = 'none';
      });
    };
  }, [reducedMotion]);

  return (
    <section id="top" className={styles.hero}>
      <div className={styles.content} ref={contentRef}>
        <p className={styles.kicker} data-animate>
          Prologue · A voyage through systems
        </p>
        <h1 data-animate>{profile.name}</h1>
        <p className={`lead ${styles.headline}`} data-animate>
          {profile.headline}
        </p>
        <p className={styles.summary} data-animate>
          {profile.summary}
        </p>
        <div className={styles.actions} data-animate>
          <Button href="#projects">Enter the system</Button>
          <Button href={profile.resumeUrl} variant="ghost" download>
            Download resume
          </Button>
        </div>
      </div>

      <div className={styles.scrollCue} aria-hidden>
        <span>Scroll to explore</span>
        <i />
      </div>
    </section>
  );
}
