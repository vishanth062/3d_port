import { profile } from '@/data/profile';
import { SocialLinks } from '@/components/common/SocialLinks';
import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>
          © {year} {profile.name}. Built with React, TypeScript, and Three.js.
        </p>
        <div className={styles.socials}>
          <SocialLinks links={profile.socials} />
        </div>
      </div>
    </footer>
  );
}
