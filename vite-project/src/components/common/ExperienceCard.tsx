import type { ExperienceRole } from '@/types/portfolio';
import styles from './ExperienceCard.module.css';

interface ExperienceCardProps {
  role: ExperienceRole;
}

export function ExperienceCard({ role }: ExperienceCardProps) {
  return (
    <article className={styles.card} data-animate>
      <div className={styles.top}>
        <div>
          <p className="eyebrow">{role.company}</p>
          <h3>{role.title}</h3>
          <p className={styles.location}>{role.location}</p>
        </div>
        <p className={styles.dates}>
          {role.start} — {role.end}
        </p>
      </div>

      {role.promotions && role.promotions.length > 0 ? (
        <ul className={styles.promotions}>
          {role.promotions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}

      <ul className={styles.summary}>
        {role.summary.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
