import { useState } from 'react';

export const useDownloadPhoto = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const download = async (url: string, filename: string) => {
    if (!url) return;
    setIsDownloading(true);

    try {
      const response = await fetch(url, { mode: 'cors' });
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
      console.error('Не удалось скачать файл. Проверка доступа:', error);
      window.open(url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return { download, isDownloading };
};