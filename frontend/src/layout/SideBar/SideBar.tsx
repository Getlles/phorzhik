import { NavButton } from '../../components/NavButton/NavButton';
import { LogoutButton } from '../../components/LogoutButton/LogoutButton';
import styles from './SideBar.module.css';
import photos from '../../assets/photos.svg';
import redact from '../../assets/redact.svg';
import logout from '../../assets/logout.svg';


export const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.menuItems}>
        <NavButton to="/account" label="Мои фото" icon={photos} />
        <NavButton to="/editor" label="Редактор" icon={redact} />
      </div>
      
      <div className={styles.downItem}>
         <LogoutButton label="Выйти" icon={logout} />
      </div>
    </aside>
  );
};