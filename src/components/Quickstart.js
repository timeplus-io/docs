import Link from '@docusaurus/Link';
import styles from './Quickstart.module.css';

export default function Grid ({ children, href }) {
  return (
    <Link href={href} className={styles.quickstart}>
      <div className={styles.text}>
        {children}
        <span className={styles.cta}>Get started &rarr;</span>
      </div>
      <div className={styles.gif}>
        <img src="/img/timeplus.gif" />
      </div>
    </Link>
  );
}