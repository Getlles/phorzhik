import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './RegisterPage.module.css';
import { Input } from '../../components/Input/Input';
import { AuthButton } from '../../components/AuthButton/AuthButton';
import { themeColors } from '../../styles/themes';
import { useRegister } from '../../hooks/useRegister';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    name, setName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    isAgreed, setIsAgreed,
    error,
    handleRegister
  } = useRegister();

  const { border, inputText, btnText } = themeColors.auth;

  return (
    <div className={styles.container}>

      <div className={`${styles.wave} ${styles.wave1}`}></div>
      <div className={`${styles.wave} ${styles.wave2}`}></div>
      <div className={`${styles.wave} ${styles.wave3}`}></div>

      <div className={styles.logoText}>Форжик</div>

      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Добро пожаловать!</h1>
        
        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.inputGrid}>
            <Input 
              placeholder="Имя" 
              value={name} 
              onChange={setName} 
              border={border!} 
              inputText={inputText!} 
            />
            <Input 
              placeholder="Адрес электронной почты" 
              value={email} 
              onChange={setEmail} 
              border={border!} 
              inputText={inputText!} 
            />
            <Input 
              placeholder="Пароль" 
              value={password} 
              onChange={setPassword} 
              border={border!} 
              inputText={inputText!} 
            />
            <Input 
              placeholder="Повторите пароль" 
              value={confirmPassword} 
              onChange={setConfirmPassword} 
              border={border!} 
              inputText={inputText!} 
            />
          </div>

          <label className={styles.checkboxContainer}>
            <input 
              type="checkbox" 
              className={styles.checkbox}
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
            />
            <span className={styles.checkboxLabel}>
              Я согласен с <span className={styles.link}>Правилами Пользования</span> и <span className={styles.link}>Политикой Конфиденциальности</span>
            </span>
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.btnWrapper}>
            <AuthButton 
              label="Зарегистрироваться" 
              border={border!} 
              btnText={btnText!} 
              onClick={() => handleRegister()} 
            />
          </div>

          <div className={styles.loginText}>
            Уже есть аккаунт? <span className={styles.loginLink} onClick={() => navigate('/login')}>Войти</span>
          </div>
        </form>
      </div>
    </div>
  );
};