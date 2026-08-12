import { LoadingAnnouncement, SkeletonCard, SkeletonPageHeader } from '@/components/Skeleton';
import styles from '../page.module.css';

export default function PlannerLoading() {
  return (
    <main id="main" className={styles.page}>
      <LoadingAnnouncement label="your planner" />
      <SkeletonPageHeader />
      <SkeletonCard height="26rem" />
      <SkeletonCard height="12rem" />
    </main>
  );
}
