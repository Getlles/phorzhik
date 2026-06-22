import styles  from './Header.module.css';
import logo from '../../assets/logo.svg';
import rim from '../../assets/rim.svg';

interface HeaderProps {
  backgroundColor?: string;
  circleColor?: string;
}

export const Header = ({ backgroundColor, circleColor }: HeaderProps) => {
  return (
    <header 
      className={styles.header} 
      style={{ backgroundColor }}
    >
      <div className={styles.leftPart}>
        <img src={logo} alt="Логотип" className={styles.logo} />
        <span className={styles.title}>Форжик</span>
      </div>

      <div className={styles.container}>
        <div 
          className={styles.circle}
          style={{ backgroundColor: circleColor }}
        ></div>
        <img 
          src={rim} 
          alt="" 
          className={styles.rim}
        />
      </div>
    </header>
  );
};