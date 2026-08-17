import { getStudent } from '@/lib/db/queries';
import { getCurrentStudentId } from '@/lib/session';
import { ProfileBoard } from './components/ProfileBoard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My Profile — StudyWise AI' };

/**
 * My Profile — flow 8, built to the approved design.
 *
 * Name and discipline are real, from `students`. Everything else — university,
 * course, level, goals, reminders, connected accounts — has no columns behind
 * it and comes from lib/mock, which is also why every tab other than Overview
 * says so rather than showing controls that store nothing.
 */
export default async function ProfilePage() {
  const student = await getStudent(getCurrentStudentId());

  return (
    <ProfileBoard
      name={student?.name ?? 'Student'}
      discipline={student?.discipline ? `${student.discipline} Student` : null}
    />
  );
}
