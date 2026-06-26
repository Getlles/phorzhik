import React from 'react';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  children: React.ReactNode;
}

export const Toolbar: React.FC<ToolbarProps> = ({ children }) => {
  return (
    <div className={styles.container}>
      {children}
    </div>
  );
};