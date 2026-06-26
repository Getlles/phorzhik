import React from 'react';
import styles from './Slider.module.css';

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  onAfterChange?: () => void;
}

export const Slider: React.FC<SliderProps> = ({ 
  value, 
  min = 0, 
  max = 100, 
  onChange, 
  onAfterChange
}) => {
  return (
    <div className={styles.container}>
      <span className={styles.valueLabel}>{value}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseUp={onAfterChange}
        onTouchEnd={onAfterChange}
        className={styles.slider}
      />
    </div>
  );
};