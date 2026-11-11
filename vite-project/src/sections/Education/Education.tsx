import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { SectionHeading } from '@/components/common/SectionHeading';
import { certifications, education } from '@/data/education';
import styles from './Education.module.css';

export function Education() {
  return (
    <AnimatedSection id="education" className={`section ${styles.education}`}>
      <div className="section-inner">
        <div data-animate>
          <SectionHeading
            eyebrow="Education"
            title="Foundations in engineering, credentials in cloud."
          />
        </div>
        <div className={styles.layout}>
          {education.map((item) => (
            <article key={item.id} className={styles.card} data-animate>
              <p className="eyebrow">{item.period}</p>
              <h3>{item.school}</h3>
              <p>{item.degree}</p>
              <p className={styles.meta}>{item.location}</p>
            </article>
          ))}
          {certifications.map((item) => (
            <article key={item.id} className={styles.card} data-animate>
              <p className="eyebrow">Certification · {item.year}</p>
              <h3>{item.name}</h3>
              <p className={styles.meta}>{item.issuer}</p>
            </article>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
