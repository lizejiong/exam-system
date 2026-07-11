import { http } from '../../shared/request'
import type {
  AnswerAnalyseResult,
  AnswerSubmitParams,
  AnswerSubmitResult,
  Exam,
  ExamAddParams,
  ExamRankingResult,
  ExamSaveParams,
} from './types'

export const examApi = {
  list: (bin?: string) =>
    http.get<Exam[]>('/exam/list', bin !== undefined ? { bin } : undefined),

  add: (data: ExamAddParams) => http.post<Exam>('/exam/add', data),

  find: (id: number) => http.get<Exam>(`/exam/find/${id}`),

  answer: (id: number) => http.get<Exam>(`/exam/answer/${id}`),

  remove: (id: number) => http.delete<void>(`/exam/delete/${id}`),

  save: (data: ExamSaveParams) => http.post<Exam>('/exam/save', data),

  publish: (id: number) => http.get<void>(`/exam/publish/${id}`),

  unpublish: (id: number) => http.get<void>(`/exam/unpublish/${id}`),
}

export const answerApi = {
  submit: (data: AnswerSubmitParams) =>
    http.post<AnswerSubmitResult>('/answer/submit', data),

  analyse: (examId: number) =>
    http.get<AnswerAnalyseResult>(`/answer/analyse/${examId}`),
}

export const analyseApi = {
  ranking: (examId: number, limit = 10) =>
    http.get<ExamRankingResult>(`/analyse/ranking/${examId}`, { limit }),
}
