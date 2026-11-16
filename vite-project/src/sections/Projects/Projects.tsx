import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { ProjectCard } from '@/components/common/ProjectCard';
import { SectionHeading } from '@/components/common/SectionHeading';
import { useScrollJourney } from '@/context/ScrollJourneyContext';
import { projects } from '@/data/projects';
import styles from './Projects.module.css';

export function Projects() {
  const { selectedProjectId, setSelectedProjectId } = useScrollJourney();

  return (
    <AnimatedSection id="projects" className={`section ${styles.projects}`}>
      <div className="section-inner">
        <div data-animate>
          <SectionHeading
            eyebrow="Projects"
            title="Orbit the systems — select a planet or a dossier below."
            description="On desktop, click a glowing planet in the scene. On any device, open a project card to read the full dossier."
          />
        </div>
        <div className={styles.grid}>
          {projects.map((project) => (
            <div
              key={project.id}
              id={`project-${project.id}`}
              onMouseEnter={() => {
                setSelectedProjectId(project.id);
              }}
              onMouseLeave={() => {
                setSelectedProjectId(null);
              }}
            >
              <ProjectCard project={project} active={selectedProjectId === project.id} />
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
