import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import { getResponseError } from '../utils/errorHandler';

export const useLogin = () => {
  const navigate = useNavigate();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('Пожалуйста, введите логин и пароль');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/login?email=${encodeURIComponent(identifier)}&password=${encodeURIComponent(password)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await getResponseError(response, 'Неверный email или пароль');
        throw new Error(errorText);
      }

      const data = await response.json();
      
      localStorage.setItem('user_id', data.user_id.toString());
      localStorage.setItem('username', data.username);
      
      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Ошибка сети');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    identifier,
    setIdentifier,
    password,
    setPassword,
    error,
    isLoading,
    handleLogin,
  };
};