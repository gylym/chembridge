import { describe, expect, it } from "vitest";
import { areStoredLessonAnswersCorrect, validateLessonCompletion } from "./quiz-validation";

const questions = [
  { correctAnswer: "B", options: '["A","B","C","D"]' },
  { correctAnswer: "C", options: '["A","B","C","D"]' },
  { correctAnswer: "D", options: '["A","B","C","D"]' },
];

describe("database lesson completion", () => {
  it("grades against stored options instead of accepting a fixed index", () => {
    expect(areStoredLessonAnswersCorrect(questions, [1, 2, 3])).toBe(true);
    expect(areStoredLessonAnswersCorrect(questions, [0, 0, 0])).toBe(false);
  });

  it("rejects incomplete and malformed question sets", () => {
    expect(areStoredLessonAnswersCorrect(questions.slice(0, 2), [1, 2])).toBe(false);
    expect(areStoredLessonAnswersCorrect([{ ...questions[0], options: "not-json" }, ...questions.slice(1)], [1, 2, 3])).toBe(false);
  });

  it("prefers a published database quiz and only falls back when none exists", () => {
    expect(validateLessonCompletion(questions, [0, 0, 0], [1, 2, 3])).toBe(true);
    expect(validateLessonCompletion(questions, [0, 0, 0], [0, 0, 0])).toBe(false);
    expect(validateLessonCompletion(null, [0, 1, 2], [0, 1, 2])).toBe(true);
    expect(validateLessonCompletion([], [0, 1, 2], [0, 1, 2])).toBe(false);
  });
});
