import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import { getResponseError } from '../utils/errorHandler';

export const useRegister = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (!isAgreed) {
      setError('Необходимо согласиться с правилами');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: name,
          email: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorText = await getResponseError(response, 'Ошибка при регистрации');
        throw new Error(errorText);
      }

      const userData = await response.json();

      localStorage.setItem('user_id', userData.id.toString());
      localStorage.setItem('username', userData.username);
      
      navigate('/account');
    } catch (err: any) {
      setError(err.message || 'Ошибка сети при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    name, setName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    isAgreed, setIsAgreed,
    error,
    isLoading,
    handleRegister
  };
};