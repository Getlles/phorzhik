import React from 'react';
import styles from './HistoryControls.module.css';
import undoIcon from '../../assets/undo.svg';
import redoIcon from '../../assets/redo.svg';

interface HistoryControlsProps {
  onUndo: () => void;
  onRedo: () => void;
}

export const HistoryControls: React.FC<HistoryControlsProps> = ({ onUndo, onRedo }) => {
  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={onUndo} title="Назад">
        <img src={undoIcon} alt="Назад" className={styles.icon} />
      </button>
      <button className={styles.button} onClick={onRedo} title="Вперед">
        <img src={redoIcon} alt="Вперед" className={styles.icon} />
      </button>
    </div>
  );
};