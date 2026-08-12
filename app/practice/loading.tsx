import { LoadingAnnouncement, SkeletonCard, SkeletonPageHeader } from '@/components/Skeleton';
import styles from '../page.module.css';

export default function PracticeLoading() {
  return (
    <main id="main" className={styles.page}>
      <LoadingAnnouncement label="practice" />
      <SkeletonPageHeader />
      <SkeletonCard height="24rem" />
      <SkeletonCard height="10rem" />
    </main>
  );
}
