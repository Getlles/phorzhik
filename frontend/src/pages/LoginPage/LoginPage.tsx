import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import { Input } from '../../components/Input/Input';
import { AuthButton } from '../../components/AuthButton/AuthButton';
import { themeColors } from '../../styles/themes';
import { useLogin } from '../../hooks/useLogin';
import { AuthBackground } from '../../components/Backgrounds/AuthBackground';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    identifier,
    setIdentifier,
    password,
    setPassword,
    error,
    handleLogin,
  } = useLogin();

  const { border, inputText, btnText } = themeColors.login;

  return (
    <div className={styles.container}>
      <AuthBackground />

      <div className={styles.leftColumn}>
        <div className={styles.logoText}>Форжик</div>
      </div>

      <div className={styles.rightColumn}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Добро пожаловать!</h1>

          <form onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              
              <Input
                placeholder="Адрес эл.почты"
                value={identifier}
                onChange={setIdentifier}
                border={border!}
                inputText={inputText!}
                labelBgColor="#9aae69"
              />
              <Input
                placeholder="Пароль"
                value={password}
                onChange={setPassword}
                border={border!}
                inputText={inputText!}
                labelBgColor="#a3b06c"
              />
            </div>

            <div className={styles.forgotPasswordWrapper}>
              <span className={styles.forgotPassword}>
                Забыл пароль
              </span>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.btnWrapper}>
              <AuthButton
                label="Войти"
                border={border!}
                btnText={btnText!}
                
              />
            </div>

            <div className={styles.registerText}>
              Нет аккаунта?
              <span className={styles.registerLink} onClick={() => navigate('/register')}>
                Зарегистрироваться
              </span>
            </div>
          </form>
        </div>
      </div>
      
    </div>
  );
};