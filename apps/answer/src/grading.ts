export type ExamQuestionType = 'radio' | 'checkbox' | 'blank';

export type UserAnswer = string | string[];

export interface ExamQuestion {
  type: ExamQuestionType;
  question: string;
  options: string[];
  score: number;
  answer: UserAnswer;
  answerAnalyse: string;
}

export interface GradeDetail {
  index: number;
  type: ExamQuestionType;
  question: string;
  options: string[];
  userAnswer: UserAnswer;
  correctAnswer: UserAnswer;
  isCorrect: boolean;
  score: number;
  gotScore: number;
  answerAnalyse: string;
}

export interface GradeResult {
  score: number;
  totalScore: number;
  detail: GradeDetail[];
}

export type AnswerContent = Record<string, UserAnswer>;

function sameStringArray(left: string[], right: string[]) {
  if (left.length !== right.length) return false;

  const normalizedLeft = [...left].sort();
  const normalizedRight = [...right].sort();
  return normalizedLeft.every((item, index) => item === normalizedRight[index]);
}

function isCorrectAnswer(question: ExamQuestion, userAnswer: UserAnswer) {
  if (question.type === 'checkbox') {
    if (!Array.isArray(question.answer) || !Array.isArray(userAnswer)) {
      return false;
    }

    return sameStringArray(userAnswer, question.answer);
  }

  return String(userAnswer) === String(question.answer);
}

export function parseExamQuestions(content: string): ExamQuestion[] {
  if (!content.trim()) return [];

  const parsed = JSON.parse(content) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error('Exam content must be an array');
  }

  return parsed.filter((item): item is ExamQuestion => {
    if (!item || typeof item !== 'object') return false;

    const question = item as Partial<ExamQuestion>;
    return (
      (question.type === 'radio' ||
        question.type === 'checkbox' ||
        question.type === 'blank') &&
      typeof question.question === 'string' &&
      Array.isArray(question.options) &&
      typeof question.score === 'number' &&
      typeof question.answerAnalyse === 'string'
    );
  });
}

export function gradeExam(
  questions: ExamQuestion[],
  answers: AnswerContent,
): GradeResult {
  const detail = questions.map((question, index) => {
    const userAnswer = answers[String(index)] ?? '';
    const isCorrect = isCorrectAnswer(question, userAnswer);

    return {
      index,
      type: question.type,
      question: question.question,
      options: question.options,
      userAnswer,
      correctAnswer: question.answer,
      isCorrect,
      score: question.score,
      gotScore: isCorrect ? question.score : 0,
      answerAnalyse: question.answerAnalyse,
    };
  });

  return {
    score: detail.reduce((sum, item) => sum + item.gotScore, 0),
    totalScore: questions.reduce((sum, item) => sum + item.score, 0),
    detail,
  };
}
