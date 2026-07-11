export { default as ExamPage } from './pages/ExamPage'
export { default as ExamEditPage } from './pages/ExamEditPage'
export { default as ExamAnswerPage } from './pages/ExamAnswerPage'
export { default as ExamAnalysePage } from './pages/ExamAnalysePage'
export { analyseApi, answerApi, examApi } from './api'
export type {
  AnswerAnalyseResult,
  AnswerContent,
  AnswerExamQuestion,
  AnswerSubmitParams,
  AnswerSubmitResult,
  Exam,
  ExamAddParams,
  ExamRankingResult,
  ExamSaveParams,
} from './types'
