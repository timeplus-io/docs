import React from 'react'
import Link from '@docusaurus/Link';
import isInternalUrl from '@docusaurus/isInternalUrl';
import ExternalLink from '@theme/Icon/ExternalLink';
import styles from './Grid.module.css';

export default function Grid ({ children }) {
  return (
    <div className={styles.grid}>
      {children}
    </div>
  );
}

export function GridItem ({ children, style = {}, href, title, cta }) {
  return (
    <>
      <Link 
        className={styles.button} 
        style={style}
        href={href}
      >
        {title && <h3>{title}</h3>}
        {children && <p>{children}</p>}
      </Link>
    </>
  );
}
