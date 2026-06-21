import { useAuth } from '../../hooks/useAuth';
import styles from './LogoutButton.module.css';

interface LogoutButtonProps {
  label: string;
  icon: string;
}

export const LogoutButton = ({ label, icon }: LogoutButtonProps) => {
  const { logout } = useAuth();

  return (
    <button onClick={logout} className={styles.button}>
      <img className={styles.icon} src={icon} alt="" />
      <span className={styles.text}>{label}</span>
    </button>
  );
};