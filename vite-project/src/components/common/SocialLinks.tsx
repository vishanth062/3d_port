import type { SocialLink } from '@/types/portfolio';
import styles from './SocialLinks.module.css';

interface SocialLinksProps {
  links: SocialLink[];
}

export function SocialLinks({ links }: SocialLinksProps) {
  return (
    <ul className={styles.list}>
      {links.map((link) => (
        <li key={link.id}>
          <a
            href={link.href}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noreferrer noopener' : undefined}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
