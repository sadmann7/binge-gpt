import styles from "@/styles/dotsloading.module.css";

const DotsLoading = () => {
  return (
    <div role="status" className="grid-cols-3">
      <div className={styles.pulse} />
    </div>
  );
};

export default DotsLoading;
