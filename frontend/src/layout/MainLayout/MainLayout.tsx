import { Header } from '../Header/Header';
import { Footer } from '../Footer/Footer';
import styles from './MainLayout.module.css';
import type { ThemeName } from '../../styles/themes';
import { themeColors } from '../../styles/themes';

interface LayoutProps {
  children: React.ReactNode;
  theme?: ThemeName;
}

export const MainLayout = ({ children, theme = 'login' }: LayoutProps) => {
   const currentTheme = themeColors[theme];

   return (
    <div className={styles.container}>
      <Header 
        backgroundColor={currentTheme.background}
        circleColor={currentTheme.circle}
      />
      
      <div className={styles.mainContent}>
        {children}
      </div>
      
      <Footer backgroundColor={currentTheme.background} />
    </div>
  );
};