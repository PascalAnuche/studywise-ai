import { getStudent } from '@/lib/db/queries';
import { getCurrentStudentId } from '@/lib/session';
import { AccountChip, AccountChipSkeleton, NotificationBell } from './Topbar';

/**
 * The account area of the topbar, split out so it can stream.
 *
 * This is the only part of the shell that needs the database. Keeping it in the
 * layout made every route in the app dynamic, which meant nothing could be sent
 * until the query finished. Behind Suspense, the sidebar and topbar paint
 * immediately and the account fills in when it is ready.
 */
export async function TopbarStatus() {
  const student = getStudent(getCurrentStudentId());

  return (
    <>
      {/*
        Notification count is not modelled yet, so this shows none rather than a
        made-up number. See AGENTS.md open items.
      */}
      <NotificationBell count={0} />
      <AccountChip name={student?.name ?? 'Student'} discipline={student?.discipline ?? null} />
    </>
  );
}

/** Placeholder of the same size, so the topbar doesn't jump when it resolves. */
export function TopbarStatusSkeleton() {
  return <AccountChipSkeleton />;
}
