import React from 'react';
import styles from './PhotoCard.module.css';
import { formatDate } from '../../utils/date';
import redact from '../../assets/redact.svg';
import download from '../../assets/download.svg';

export interface PhotoCardProps {
  imageUrl?: string;
  updatedAt: string | Date;
  onEdit: () => void;
  onDownload: () => void;
} 

export const PhotoCard: React.FC<PhotoCardProps> = ({
  imageUrl,
  updatedAt,
  onEdit,
  onDownload,
}) => {
  return (
    <div className={styles.card}>
      
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Фотография" 
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholder} />
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.dateText}>
          Изменено: {formatDate(updatedAt)}
        </div>

        <div className={styles.btnGroup}>
          <button 
            onClick={onEdit}
            className={styles.actionBtn}
            title="Редактировать"
            aria-label="Редактировать изображение"
          >
            <img className={styles.icon} src={redact} alt="" />
          </button>

          <button 
            onClick={onDownload}
            className={styles.actionBtn}
            title="Скачать"
            aria-label="Скачать изображение"
          >
            <img className={styles.icon} src={download} alt="" />
          </button>
        </div>
      </div>
    </div>
  );
};