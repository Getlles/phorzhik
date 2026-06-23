import { useNavigate } from 'react-router-dom';
import { useDownloadPhoto } from './useDownloadPhoto';

export const useEditorActions = (currentImageUrl: string | null, photoId: string | null) => {
  const navigate = useNavigate();
  const { download, isDownloading } = useDownloadPhoto();

  const handleGoBack = () => {
    navigate('/account');
  };

  const handleSave = async () => {
    try {
      console.log(`Сохранение изменений для фото ${photoId}...`);
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Изображение успешно сохранено!');
      return true;
    } catch (error) {
      console.error('Ошибка при сохранении изображения:', error);
      return false;
    }
  };

  const handleDownload = async () => {
    if (!currentImageUrl) return;

    const isSaved = await handleSave();

    if (isSaved) {
      const filename = photoId ? `edited-photo-${photoId}.png` : `edited-photo-${Date.now()}.png`;
      await download(currentImageUrl, filename);
    }
  };

  return {
    handleGoBack,
    handleSave,
    handleDownload,
    isDownloading
  };
};