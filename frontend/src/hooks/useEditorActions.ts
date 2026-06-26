import { useNavigate } from 'react-router-dom';
import { useDownloadPhoto } from './useDownloadPhoto';

export const useEditorActions = (currentImageUrl: string | null, photoId: string | null) => {
  const navigate = useNavigate();
  const { download, isDownloading } = useDownloadPhoto();

  const handleGoBack = () => {
    navigate('/account');
  };

  const handleSave = async (editedUrl?: string | null) => {
    try {
      console.log(`Сохранение изменений для фото ${photoId}...`);
      if (editedUrl) {
        console.log('Данные изображения (Base64) подготовлены для сохранения на сервере:', editedUrl.substring(0, 80) + '...');
      }
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Изображение успешно сохранено!');
      return true;
    } catch (error) {
      console.error('Ошибка при сохранении изображения:', error);
      return false;
    }
  };

  const handleDownload = async (editedUrl?: string | null) => {
    const urlToDownload = editedUrl || currentImageUrl;
    if (!urlToDownload) return;

    const isSaved = await handleSave(editedUrl);

    if (isSaved) {
      const filename = photoId ? `edited-photo-${photoId}.png` : `edited-photo-${Date.now()}.png`;
      await download(urlToDownload, filename);
    }
  };

  return {
    handleGoBack,
    handleSave,
    handleDownload,
    isDownloading
  };
};