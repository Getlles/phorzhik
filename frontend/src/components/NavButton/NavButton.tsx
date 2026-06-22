import { NavLink } from 'react-router-dom';
import styles from './NavButton.module.css';

interface NavButtonProps {
  to: string;
  label: string;
  icon: string;
}

export const NavButton = ({ to, label, icon }: NavButtonProps) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `${styles.button} ${isActive ? styles.active : ''}`}
    >
      <img className={styles.icon} src={icon} alt="" />
      <span className={styles.text}>{label}</span>
    </NavLink>
  );
};