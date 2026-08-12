import { LoadingAnnouncement, SkeletonCard, SkeletonPageHeader } from '@/components/Skeleton';
import styles from '../page.module.css';

export default function AssistantLoading() {
  return (
    <main id="main" className={styles.page}>
      <LoadingAnnouncement label="the study assistant" />
      <SkeletonPageHeader />
      <SkeletonCard height="14rem" />
      <SkeletonCard height="14rem" />
      <SkeletonCard height="6rem" />
    </main>
  );
}
