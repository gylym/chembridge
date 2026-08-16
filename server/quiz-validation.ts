export type StoredLessonQuestion = {
  correctAnswer: string;
  options: string | null;
};

export function areStoredLessonAnswersCorrect(
  questions: StoredLessonQuestion[],
  answers: number[],
) {
  if (questions.length !== 3 || answers.length !== questions.length) return false;
  return questions.every((question, index) => {
    let options: unknown = null;
    try { options = question.options ? JSON.parse(question.options) : null; } catch { options = null; }
    return Array.isArray(options)
      && options.every((option) => typeof option === "string")
      && options[answers[index]] === question.correctAnswer;
  });
}

export function validateLessonCompletion(
  storedQuestions: StoredLessonQuestion[] | null,
  staticCorrectIndexes: number[] | null,
  answers: number[],
) {
  // A selected published database quiz is authoritative, including when it is
  // malformed or incomplete. Static content is only a true fallback.
  if (storedQuestions !== null) return areStoredLessonAnswersCorrect(storedQuestions, answers);
  if (!staticCorrectIndexes || staticCorrectIndexes.length < 3 || answers.length !== staticCorrectIndexes.length) return false;
  return staticCorrectIndexes.every((correctIndex, index) => answers[index] === correctIndex);
}
