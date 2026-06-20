import { useNavigate } from 'react-router-dom';
import styles from './LogoutButton.module.css';

interface LogoutButtonProps {
  label: string;
  icon: string;
}

export const LogoutButton = ({ label, icon }: LogoutButtonProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    
    navigate('/login');
  };

  return (
    <button onClick={handleLogout} className={styles.button}>
      <img className={styles.icon} src={icon} alt="" />
      <span className={styles.text}>{label}</span>
    </button>
  );
};