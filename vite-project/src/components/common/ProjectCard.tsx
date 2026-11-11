import type { ProjectItem } from '@/types/portfolio';
import { cn } from '@/utils/cn';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  project: ProjectItem;
  active?: boolean;
}

export function ProjectCard({ project, active = false }: ProjectCardProps) {
  return (
    <article className={cn(styles.card, active && styles.active)} data-animate>
      <div className={styles.meta}>
        <p className="eyebrow">{project.domain}</p>
        <p className={styles.period}>{project.period}</p>
      </div>
      <h3>{project.name}</h3>
      <p className={styles.tagline}>{project.tagline}</p>
      <p className={styles.role}>{project.role}</p>
      <ul className={styles.highlights}>
        {project.highlights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <ul className={styles.stack}>
        {project.stack.map((tech) => (
          <li key={tech}>{tech}</li>
        ))}
      </ul>
    </article>
  );
}
