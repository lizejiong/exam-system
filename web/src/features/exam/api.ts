import { http } from '../../shared/request'
import type { Exam, ExamAddParams, ExamSaveParams } from './types'

export const examApi = {
  list: (bin?: string) =>
    http.get<Exam[]>('/exam/list', bin !== undefined ? { bin } : undefined),

  add: (data: ExamAddParams) => http.post<Exam>('/exam/add', data),

  remove: (id: number) => http.delete<void>(`/exam/delete/${id}`),

  save: (data: ExamSaveParams) => http.post<Exam>('/exam/save', data),

  publish: (id: number) => http.get<void>(`/exam/publish/${id}`),

  unpublish: (id: number) => http.get<void>(`/exam/unpublish/${id}`),
}
