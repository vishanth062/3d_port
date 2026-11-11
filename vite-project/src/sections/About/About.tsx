import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { SectionHeading } from '@/components/common/SectionHeading';
import { profile } from '@/data/profile';
import styles from './About.module.css';

export function About() {
  return (
    <AnimatedSection id="about" className={`section ${styles.about}`}>
      <div className="section-inner">
        <div data-animate>
          <SectionHeading
            eyebrow="About"
            title="Engineering multi-tenant systems with clarity and craft."
            description="Professional introduction grounded in shipped SaaS work across hospitality and healthcare."
          />
        </div>
        <div className={styles.grid}>
          {profile.about.map((paragraph) => (
            <p key={paragraph} data-animate>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
