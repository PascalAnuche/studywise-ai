import { LoadingAnnouncement, SkeletonCard, SkeletonPageHeader } from '@/components/Skeleton';
import styles from '../page.module.css';

export default function ProgressLoading() {
  return (
    <main id="main" className={styles.page}>
      <LoadingAnnouncement label="your progress" />
      <SkeletonPageHeader />
      <SkeletonCard height="16rem" />
    </main>
  );
}
