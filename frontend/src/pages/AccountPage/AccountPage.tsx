import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AccountPage.module.css';
import { PhotoCard } from '../../components/PhotoCard/PhotoCard';
import { useDownloadPhoto } from '../../hooks/useDownloadPhoto';
import type { Photo } from '../../types/photo';
import { Sidebar } from '../../layout/SideBar/SideBar';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { download } = useDownloadPhoto();

  const mockPhotos: Photo[] = [
    { id: '1', imageUrl: 'https://picsum.photos/id/237/400/300', updatedAt: '2026-05-21T12:00:00Z' },
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
      <div className={`${styles.decor} ${styles.decor1}`}></div>
      <div className={`${styles.decor} ${styles.decor2}`}></div>
      <div className={`${styles.decor} ${styles.decor3}`}></div>
      <div className={`${styles.decor} ${styles.decor4}`}></div>

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