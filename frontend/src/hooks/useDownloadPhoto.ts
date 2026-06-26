import { useState } from 'react';
import { useAuth } from './useAuth';
import { API_BASE_URL } from '../services/api';

export const useDownloadPhoto = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { getUserId } = useAuth();
  const userId = getUserId();

  const download = async (url: string, filename: string, photoId?: string | number) => {
    if (!url) return;
    setIsDownloading(true);

    try {
      let downloadUrl = url;

      if (photoId && userId) {
        downloadUrl = `${API_BASE_URL}/photos/${photoId}/download?user_id=${userId}`;
      }

      const response = await fetch(downloadUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Ошибка сети при скачивании файла');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Не удалось скачать файл через API, пробуем открыть напрямую:', error);
      window.open(url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return { download, isDownloading };
};