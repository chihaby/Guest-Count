import styles from "../styles/button.module.css";

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "danger" | "convene_primary" | "convene_secondary";
}

export default function Button({
  children,
  onClick,
  variant = "primary",
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}