import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { ExperienceCard } from '@/components/common/ExperienceCard';
import { SectionHeading } from '@/components/common/SectionHeading';
import { experience } from '@/data/experience';
import styles from './Experience.module.css';

export function Experience() {
  return (
    <AnimatedSection id="experience" className={`section ${styles.experience}`}>
      <div className="section-inner">
        <div data-animate>
          <SectionHeading
            eyebrow="Experience"
            title="A promotion-driven path through cloud-native SaaS."
            description="Verified roles and contributions from the current résumé."
          />
        </div>
        <div className={styles.list}>
          {experience.map((role) => (
            <ExperienceCard key={role.id} role={role} />
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
