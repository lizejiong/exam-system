import { gradeExam } from './grading';

describe('gradeExam', () => {
  it('grades radio, checkbox and blank questions', () => {
    const result = gradeExam(
      [
        {
          type: 'radio',
          question: 'Longest river?',
          options: ['A', 'B'],
          score: 5,
          answer: 'A',
          answerAnalyse: 'A is correct',
        },
        {
          type: 'checkbox',
          question: 'Select prime numbers',
          options: ['2', '3', '4'],
          score: 10,
          answer: ['2', '3'],
          answerAnalyse: '2 and 3 are prime',
        },
        {
          type: 'blank',
          question: '1 + 1 = ?',
          options: [],
          score: 3,
          answer: '2',
          answerAnalyse: 'Basic addition',
        },
      ],
      {
        0: 'A',
        1: ['3', '2'],
        2: '3',
      },
    );

    expect(result.score).toBe(15);
    expect(result.totalScore).toBe(18);
    expect(result.detail).toEqual([
      expect.objectContaining({
        index: 0,
        isCorrect: true,
        gotScore: 5,
      }),
      expect.objectContaining({
        index: 1,
        isCorrect: true,
        gotScore: 10,
      }),
      expect.objectContaining({
        index: 2,
        isCorrect: false,
        gotScore: 0,
      }),
    ]);
  });
});
