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
