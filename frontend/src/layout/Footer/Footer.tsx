import styles from './Footer.module.css';

interface FooterProps {
  backgroundColor?: string;
}

export const Footer = ({ backgroundColor }: FooterProps) => {
  return (
    <footer 
      className={styles.footer}
      style={{ backgroundColor }}
    >
        
    </footer>
  );
};