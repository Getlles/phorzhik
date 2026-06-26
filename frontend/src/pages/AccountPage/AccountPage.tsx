import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AccountPage.module.css';
import { PhotoCard } from '../../components/PhotoCard/PhotoCard';
import { useDownloadPhoto } from '../../hooks/useDownloadPhoto';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL, IMAGE_BASE_URL } from '../../services/api';
import { getResponseError } from '../../utils/errorHandler';
import type { Photo } from '../../types/photo';
import { Sidebar } from '../../layout/SideBar/SideBar';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { download } = useDownloadPhoto();
  const { getUserId, getUsername, isAuthenticated } = useAuth();
  
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = getUserId();
  const username = getUsername() || 'Пользователь';

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      navigate('/login');
    }
  }, [isAuthenticated, userId, navigate]);

  const fetchGallery = async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/gallery/${userId}`);
      
      if (!response.ok) {
        const errorText = await getResponseError(response, 'Не удалось загрузить галерею');
        throw new Error(errorText);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Сервер вернул некорректный ответ.');
      }

      const data = await response.json();
      
      const formattedPhotos: Photo[] = data.map((p: any) => {
        const timestamp = new Date(p.changed_at).getTime();
        
        return {
          id: p.id.toString(),
          imageUrl: `${IMAGE_BASE_URL}${p.filepath}?t=${timestamp}`,
          updatedAt: p.changed_at,
        };
      });
      
      setPhotos(formattedPhotos);
    } catch (err: any) {
      setError(err.message || 'Ошибка сети при загрузке галереи');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, [userId]);

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
    download(photo.imageUrl, `photo-${photo.id}.jpg`, photo.id);
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
            <h1 className={styles.title}>Добро пожаловать, {username}!</h1>
            
            {loading && <div className={styles.statusText}>Загрузка галереи...</div>}
            {error && <div className={styles.errorText}>{error}</div>}
            {!loading && photos.length === 0 && !error && (
              <div className={styles.statusText}>
                У вас пока нет сохраненных фотографий. Нажмите «Редактор» в меню, чтобы загрузить и обработать ваше первое изображение!
              </div>
            )}

            <div className={styles.grid}>
              {photos.map((photo) => (
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