import { useRef, type ChangeEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { NavButton } from '../../components/NavButton/NavButton';
import { LogoutButton } from '../../components/LogoutButton/LogoutButton';
import { useSidebarActions } from '../../hooks/useSidebarActions';
import styles from './SideBar.module.css';
import photos from '../../assets/photos.svg';
import redact from '../../assets/redact.svg';
import logout from '../../assets/logout.svg';

export const Sidebar = () => {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isUploading, uploadAndRedirect } = useSidebarActions();

  const handleEditorClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadAndRedirect(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.menuItems}>
        <NavButton to="/account" label="Мои фото" icon={photos} />
        
        <button 
          onClick={handleEditorClick} 
          className={`${styles.downItem} ${location.pathname === '/editor' ? styles.active : ''}`}
          disabled={isUploading}
        >
          <img className={styles.icon} src={redact} alt="Редактировать" />
          <span className={styles.text}>
            {isUploading ? 'Загрузка...' : 'Редактор'}
          </span>
        </button>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
          accept="image/*"
        />
      </div>
      
      <div className={styles.downItem}>
         <LogoutButton label="Выйти" icon={logout} />
      </div>
    </aside>
  );
};