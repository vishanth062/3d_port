import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { Button } from '@/components/common/Button';
import { SectionHeading } from '@/components/common/SectionHeading';
import { SocialLinks } from '@/components/common/SocialLinks';
import { profile } from '@/data/profile';
import styles from './Contact.module.css';

export function Contact() {
  return (
    <AnimatedSection id="contact" className={`section ${styles.contact}`}>
      <div className={`section-inner ${styles.inner}`}>
        <div data-animate>
          <SectionHeading
            eyebrow="Contact"
            title="Let's build the next orbit together."
            description="Open to conversations about full-stack SaaS, cloud-native systems, and developer tooling."
          />
        </div>
        <div className={styles.panel} data-animate>
          <div className={styles.orb} aria-hidden />
          <p className={styles.email}>{profile.email}</p>
          <p className={styles.phone}>{profile.phone}</p>
          <p className={styles.location}>{profile.location}</p>
          <div className={styles.actions}>
            <Button href={`mailto:${profile.email}?subject=Hello%20Vishanth`}>
              Send an email
            </Button>
            <SocialLinks links={profile.socials} />
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
