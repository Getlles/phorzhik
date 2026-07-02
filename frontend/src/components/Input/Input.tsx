import styles from './Input.module.css';

interface InputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  border: string;
  inputText: string;
  labelBgColor?: string;
}

export const Input = ({ placeholder, value, onChange, border, inputText, labelBgColor = '#ffffff' }: InputProps) => {
  return (
    <div className={styles.container} style={{ '--label-bg': labelBgColor } as React.CSSProperties}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.input}
        placeholder=" "
        style={{
          borderColor: border,
          color: inputText,
        }}
      />
      <label 
        className={styles.label}
        style={{ color: inputText }}
      >
        {placeholder}
      </label>
    </div>
  );
};