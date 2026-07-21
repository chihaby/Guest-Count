import styles from "../styles/counterCard.module.css";

interface CounterCardProps {
  title: string;
  count: number;
}

export default function CounterCard({
  title,
  count,
}: CounterCardProps) {
  return (
    <div className={styles.card}>
      <h2>{title}</h2>
      <div className={styles.count}>
        {count}
      </div>
    </div>
  );
}