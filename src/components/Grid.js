import Link from '@docusaurus/Link';
import styles from './Grid.module.css';

export default function Grid ({ children }) {
  return (
    <div className={styles.grid}>
      {children}
    </div>
  );
}

export function GridItem ({ children, href }) {
  return (
    <Link 
      className={styles.button} 
      href={href}
    >
      {children}
    </Link>
  );
}