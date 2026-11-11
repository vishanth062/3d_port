import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { SectionHeading } from '@/components/common/SectionHeading';
import { foundations } from '@/data/foundations';
import styles from './Foundations.module.css';

export function Foundations() {
  return (
    <AnimatedSection id="foundations" className={`section ${styles.foundations}`}>
      <div className="section-inner">
        <div data-animate>
          <SectionHeading
            eyebrow="Early foundations"
            title="The curiosity that preceded professional software engineering."
            description="A compact look at college-era labs and exploration that shaped the space-themed identity of this portfolio."
          />
        </div>
        <div className={styles.grid}>
          {foundations.map((group) => (
            <article key={group.id} className={styles.card} data-animate>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
