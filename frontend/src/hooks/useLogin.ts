import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const navigate = useNavigate();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('Пожалуйста, введите логин и пароль');
      return;
    }

    localStorage.setItem('token', 'mock_jwt_token_123');
    
    navigate('/account');
  };

  return {
    identifier,
    setIdentifier,
    password,
    setPassword,
    error,
    handleLogin,
  };
};