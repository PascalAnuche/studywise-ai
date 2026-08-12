import {
  LoadingAnnouncement,
  SkeletonCard,
  SkeletonColumns,
  SkeletonHero,
  SkeletonTiles,
} from '@/components/Skeleton';
import styles from './page.module.css';

export default function DashboardLoading() {
  return (
    <main id="main" className={styles.page}>
      <LoadingAnnouncement label="your dashboard" />
      <SkeletonHero />
      <SkeletonTiles />
      <SkeletonColumns>
        <SkeletonCard height="22rem" />
        <SkeletonCard height="18rem" />
      </SkeletonColumns>
    </main>
  );
}
