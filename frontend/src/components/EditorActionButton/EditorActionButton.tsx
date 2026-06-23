import React from 'react';
import styles from './EditorActionButton.module.css';

interface EditorActionButtonProps {
  icon: string;
  onClick: () => void;
  altText: string;
  disabled?: boolean;
}

export const EditorActionButton: React.FC<EditorActionButtonProps> = ({ 
  icon, 
  onClick, 
  altText,
  disabled = false
}) => {
  return (
    <button 
      className={styles.button} 
      onClick={onClick}
      title={altText}
      aria-label={altText}
      disabled={disabled}
    >
      <img src={icon} alt={altText} className={styles.icon} />
    </button>
  );
};