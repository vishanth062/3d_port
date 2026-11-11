import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  as?: 'section' | 'div';
}

export function AnimatedSection({
  children,
  className,
  id,
  as = 'section',
}: AnimatedSectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const Tag = as as ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const targets = el.querySelectorAll<HTMLElement>('[data-animate]');

    if (reducedMotion) {
      targets.forEach((node) => {
        node.style.opacity = '1';
        node.style.transform = 'none';
      });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.08,
          clearProps: 'transform',
          scrollTrigger: {
            trigger: el,
            start: 'top 78%',
            once: true,
          },
        },
      );
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
    <Tag id={id} className={className} ref={ref}>
      {children}
    </Tag>
  );
}
