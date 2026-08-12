import 'server-only';

/**
 * Stands in for authentication, which is not specified in the PRD yet and has
 * no fields on the `students` table.
 *
 * Every route resolves the student through this one function, so wiring real
 * auth later is a change here rather than a hunt through route handlers.
 *
 * TODO: authentication not yet decided, see AGENTS.md Open Items.
 */
export function getCurrentStudentId(): number {
  return 1;
}
