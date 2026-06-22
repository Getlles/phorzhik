import styles from './AuthButton.module.css';

interface AuthButtonProps {
  label: string;
  onClick?: () => void;
  border: string;
  btnText: string;
}

export const AuthButton = ({ label, onClick, border, btnText, }: AuthButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={styles.button}
      style={{
        borderColor: border,
        color: btnText,
      }}
    >
      {label}
    </button>
  );
};