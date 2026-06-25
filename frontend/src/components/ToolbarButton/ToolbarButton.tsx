import React from 'react';
import styles from './ToolbarButton.module.css';

interface ToolbarButtonProps {
  icon: string;
  onClick: () => void;
  isActive?: boolean;
  altText: string;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  icon, 
  onClick, 
  isActive, 
  altText 
}) => {
  return (
    <button 
      className={`${styles.button} ${isActive ? styles.active : ''}`}
      onClick={onClick}
      aria-label={altText}
      title={altText}
    >
      <img src={icon} alt={altText} className={styles.icon} />
    </button>
  );
};