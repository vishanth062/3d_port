import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { SectionHeading } from '@/components/common/SectionHeading';
import { skillCategories } from '@/data/skills';
import styles from './Skills.module.css';

export function Skills() {
  return (
    <AnimatedSection id="skills" className={`section ${styles.skills}`}>
      <div className="section-inner">
        <div data-animate>
          <SectionHeading
            eyebrow="Skills"
            title="A constellation of languages, platforms, and delivery craft."
            description="Organized by the categories on the résumé — readable first, atmospheric second."
          />
        </div>
        <div className={styles.grid}>
          {skillCategories.map((category) => (
            <article key={category.id} className={styles.card} data-animate>
              <h3>{category.title}</h3>
              <ul>
                {category.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
