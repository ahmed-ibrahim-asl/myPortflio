import styles from "./ModelMission.module.css";

type MissionRecommendationProps = {
  recommendation: {
    label: string;
    reason: string;
  } | null;
};

export function MissionRecommendation({
  recommendation,
}: MissionRecommendationProps) {
  if (!recommendation) return null;

  return (
    <p className={styles.recommendation}>
      <strong>Recommended:</strong> {recommendation.label}. {recommendation.reason}
    </p>
  );
}
