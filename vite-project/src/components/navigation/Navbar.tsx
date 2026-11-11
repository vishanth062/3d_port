import { useEffect, useState } from 'react';
import { navItems } from '@/data/navigation';
import { profile } from '@/data/profile';
import { useActiveSection } from '@/hooks/useActiveSection';
import { cn } from '@/utils/cn';
import styles from './Navbar.module.css';

export function Navbar() {
  const activeId = useActiveSection();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('nav-open', open);
    return () => {
      document.body.classList.remove('nav-open');
    };
  }, [open]);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia('(min-width: 860px)').matches) {
        setOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <a className={styles.brand} href="#top" onClick={() => setOpen(false)}>
          {profile.name}
        </a>

        <button
          type="button"
          className={cn(styles.menuToggle, open && styles.menuToggleOpen)}
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => {
            setOpen((value) => !value);
          }}
        >
          <span className="sr-only">Toggle navigation</span>
          <span />
          <span />
          <span />
        </button>

        <nav
          id="primary-navigation"
          className={cn(styles.nav, open && styles.navOpen)}
          aria-label="Primary"
        >
          <ul>
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  className={cn(activeId === item.id && styles.active)}
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
