import { NextResponse } from 'next/server';

/**
 * Small request helpers. Deliberately hand-rolled rather than adding a schema
 * library for four routes; swap in zod if validation grows past this.
 */

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message: string) {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(message = 'Something went wrong') {
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function requireString(
  body: Record<string, unknown>,
  key: string,
  { maxLength = 4000 } = {}
): string | null {
  const value = body[key];
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
}

export function optionalString(body: Record<string, unknown>, key: string): string | null {
  const value = body[key];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function requireNumber(body: Record<string, unknown>, key: string): number | null {
  const value = body[key];
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null;
}

export function requireBoolean(body: Record<string, unknown>, key: string): boolean | null {
  const value = body[key];
  return typeof value === 'boolean' ? value : null;
}

export interface SubmittedAnswer {
  questionId: number;
  studentAnswer: string;
}

/**
 * Shared by the answers and submit routes so a draft save and a final
 * submission can never disagree about what a valid answer looks like.
 *
 * Lives here rather than being exported from a route file: Next validates the
 * exports of a route module, and extra symbols don't belong in one.
 */
export function parseAnswers(value: unknown): SubmittedAnswer[] | null {
  if (!Array.isArray(value)) return null;

  const answers: SubmittedAnswer[] = [];
  for (const raw of value) {
    if (typeof raw !== 'object' || raw === null) return null;
    const item = raw as Record<string, unknown>;

    const questionId = item.questionId;
    const studentAnswer = item.studentAnswer;
    if (typeof questionId !== 'number' || !Number.isInteger(questionId)) return null;
    if (typeof studentAnswer !== 'string') return null;

    answers.push({ questionId, studentAnswer });
  }
  return answers;
}
