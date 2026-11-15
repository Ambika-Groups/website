// Types for scripts/launch-questions.mjs (read by src/lib/answers.test.ts).
export interface LaunchQuestion {
  key: string;
  /** The entry in src/config/launch-answers.ts that answers it (the quick path); absent = answered elsewhere. */
  answerKey?: string;
  tier: "must" | "nice";
  page: string;
  question: string;
  example: string;
  ifSkipped: string;
  where: string;
  skip?: boolean;
}
export const questions: LaunchQuestion[];
export const tierLabel: Record<"must" | "nice", string>;
export const ownerStatus: Record<string, { status: "answered" | "skipped" | "later"; note: string }>;
