export interface Exam {
  id: number
  name: string
  content: string
  createUserId: number
  isDelete: boolean
  isPublish: boolean
  createTime: string
  updateTime: string
}

export interface ExamAddParams {
  name: string
}

export interface ExamSaveParams {
  id: number
  name?: string
  content: string
}

export type ExamQuestionType = 'radio' | 'checkbox' | 'blank'

export interface ExamQuestion {
  type: ExamQuestionType
  question: string
  options: string[]
  score: number
  answer: string | string[]
  answerAnalyse: string
}

export type UserAnswer = string | string[]

export type AnswerContent = Record<string, UserAnswer>

export interface AnswerExamQuestion {
  type: ExamQuestionType
  question: string
  options: string[]
  score: number
}

export interface AnswerSubmitParams {
  examId: number
  answers: AnswerContent
}

export interface AnswerResultDetail {
  index: number
  type: ExamQuestionType
  question: string
  options: string[]
  userAnswer: UserAnswer
  correctAnswer: UserAnswer
  isCorrect: boolean
  score: number
  gotScore: number
  answerAnalyse: string
}

export interface AnswerSubmitResult {
  id: number
  examId: number
  score: number
  totalScore: number
  detail: AnswerResultDetail[]
  createTime: string
  answerer: {
    id: number
    username: string
  }
  exam: {
    id: number
    name: string
  }
}

export interface AnswerAnalyseResult {
  exam: {
    id: number
    name: string
    isPublish: boolean
  }
  totalSubmit: number
  totalScore: number
  averageScore: number
  maxScore: number
  minScore: number
  records: Array<{
    id: number
    score: number
    totalScore: number
    createTime: string
    answerer: {
      id: number
      username: string
    }
  }>
  questions: Array<{
    index: number
    question: string
    correctCount: number
    totalCount: number
    correctRate: number
  }>
}
