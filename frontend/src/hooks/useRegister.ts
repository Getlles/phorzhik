import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useRegister = () => {
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = (e?: React.FormEvent) => {
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

    localStorage.setItem('token', 'mock_jwt_token_123');
    
    navigate('/account');
  };

  return {
    name, setName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    isAgreed, setIsAgreed,
    error,
    handleRegister
  };
};