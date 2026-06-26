import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const getUserId = (): number | null => {
    const id = localStorage.getItem('user_id');
    return id ? parseInt(id, 10) : null;
  };

  const getUsername = (): string | null => {
    return localStorage.getItem('username');
  };

  return {
    logout,
    getUserId,
    getUsername,
    isAuthenticated: !!localStorage.getItem('user_id'),
  };
};