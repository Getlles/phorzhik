import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { API_BASE_URL, IMAGE_BASE_URL } from '../services/api';

export const useSidebarActions = () => {
  const navigate = useNavigate();
  const { getUserId } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const uploadAndRedirect = async (file: File) => {
    const userId = getUserId();

    if (!userId) {
      alert('Ошибка: пользователь не авторизован');
      navigate('/login');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload?user_id=${userId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Не удалось загрузить фотографию на сервер');
      }

      const photoData = await response.json();

      navigate('/editor', {
        state: {
          imageUrl: `${IMAGE_BASE_URL}${photoData.filepath}`,
          photoId: photoData.id.toString()
        }
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Произошла ошибка при загрузке фото');
    } finally {
      setIsUploading(false);
    }
  };

  return { isUploading, uploadAndRedirect };
};