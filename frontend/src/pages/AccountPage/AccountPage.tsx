import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AccountPage.module.css';
import { PhotoCard } from '../../components/PhotoCard/PhotoCard';
import { useDownloadPhoto } from '../../hooks/useDownloadPhoto';
import type { Photo } from '../../types/photo';
import { Sidebar } from '../../layout/SideBar/SideBar';
import rim from '../../assets/rim.svg';


export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { download } = useDownloadPhoto();

  const mockPhotos: Photo[] = [
    { id: '1', imageUrl: 'https://picsum.photos/400/300?random=1', updatedAt: '2026-05-21T12:00:00Z' },
    { id: '2', imageUrl: 'https://picsum.photos/400/300?random=2', updatedAt: '2026-05-21T12:00:00Z' },
    { id: '3', imageUrl: 'https://picsum.photos/400/300?random=3', updatedAt: '2026-05-21T12:00:00Z' },
    { id: '4', imageUrl: 'https://picsum.photos/400/300?random=4', updatedAt: '2026-05-21T12:00:00Z' },
    { id: '5', imageUrl: 'https://picsum.photos/400/300?random=5', updatedAt: '2026-05-21T12:00:00Z' },
    { id: '6', imageUrl: 'https://picsum.photos/400/300?random=6', updatedAt: '2026-05-21T12:00:00Z' },
    { id: '7', imageUrl: 'https://picsum.photos/400/300?random=7', updatedAt: '2026-05-21T12:00:00Z' },
  ];

  const handleEdit = (photo: Photo) => {
    if (!photo.imageUrl) return;
    
    navigate('/editor', { 
      state: { 
        imageUrl: photo.imageUrl, 
        photoId: photo.id 
      } 
    });
  };

  const handleDownload = (photo: Photo) => {
    if (!photo.imageUrl) return;
    const filename = `photo-${photo.id}.jpg`;
    download(photo.imageUrl, filename);
  };

  return (
        <div className={styles.container}>
          <div className={`${styles.rimDecor} ${styles.rim1}`} style={{ backgroundImage: `url(${rim})` }} />
          <div className={`${styles.rimDecor} ${styles.rim2}`} style={{ backgroundImage: `url(${rim})` }} />
          <div className={`${styles.rimDecor} ${styles.rim3}`} style={{ backgroundImage: `url(${rim})` }} />
          <div className={`${styles.rimDecor} ${styles.rim4}`} style={{ backgroundImage: `url(${rim})` }} />
          <div className={`${styles.rimDecor} ${styles.rim5}`} style={{ backgroundImage: `url(${rim})` }} />
          <div className={`${styles.rimDecor} ${styles.rim6}`} style={{ backgroundImage: `url(${rim})` }} />
          <div className={`${styles.rimDecor} ${styles.rim7}`} style={{ backgroundImage: `url(${rim})` }} />

  

      <div className={styles.content}>
        <Sidebar />

        <div className={styles.innerContent}>
            
            <h1 className={styles.title}>Добро пожаловать!</h1>
            
            <div className={styles.grid}>
            {mockPhotos.map((photo) => (
                <PhotoCard
                key={photo.id}
                imageUrl={photo.imageUrl}
                updatedAt={photo.updatedAt}
                onEdit={() => handleEdit(photo)}
                onDownload={() => handleDownload(photo)}
                />
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};