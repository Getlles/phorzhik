import { useNavigate } from 'react-router-dom';
import { useDownloadPhoto } from './useDownloadPhoto';
import { useAuth } from './useAuth';
import { API_BASE_URL, dataURLtoFile } from '../services/api';

export const useEditorActions = (currentImageUrl: string | null, photoId: string | null) => {
  const navigate = useNavigate();
  const { download, isDownloading } = useDownloadPhoto();
  const { getUserId } = useAuth();
  const userId = getUserId();

  const handleGoBack = () => {
    navigate('/account');
  };

  const handleSave = async (editedBase64Url?: string | null): Promise<boolean> => {
    if (!editedBase64Url) {
      console.warn('Нет данных для сохранения');
      return false;
    }

    if (!userId) {
      alert('Ошибка: пользователь не авторизован');
      return false;
    }

    try {
      const file = dataURLtoFile(editedBase64Url, `edited_${photoId || Date.now()}.png`);
      
      const formData = new FormData();
      formData.append('file', file);

      const updateParam = photoId ? `&photo_id=${photoId}` : '';
      
      const response = await fetch(`${API_BASE_URL}/upload?user_id=${userId}${updateParam}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Не удалось сохранить изменения на сервере');
      }

      console.log('Изображение успешно перезаписано!');
      return true;
    } catch (error) {
      console.error('Ошибка при сохранении изображения:', error);
      alert('Не удалось сохранить изменения.');
      return false;
    }
  };

  const handleDownload = async (editedBase64Url?: string | null) => {
    const urlToDownload = editedBase64Url || currentImageUrl;
    if (!urlToDownload) return;

    const isSaved = await handleSave(editedBase64Url);

    if (isSaved) {
      const filename = photoId ? `edited-photo-${photoId}.png` : `edited-photo-${Date.now()}.png`;
      await download(urlToDownload, filename, photoId ? parseInt(photoId, 10) : undefined);
    }
  };

  return {
    handleGoBack,
    handleSave,
    handleDownload,
    isDownloading
  };
};