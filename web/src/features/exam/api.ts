import { http } from '../../shared/request'
import type { Exam, ExamAddParams, ExamSaveParams } from './types'

export const examApi = {
  /** 列出当前用户的考试；传 bin 查回收站 */
  list: (bin?: string) =>
    http.get<Exam[]>('/exam/list', bin !== undefined ? { bin } : undefined),

  /** 新建考试 */
  add: (data: ExamAddParams) => http.post<Exam>('/exam/add', data),

  /** 软删除 */
  remove: (id: number) => http.delete<void>(`/exam/delete/${id}`),

  /** 保存考试内容 */
  save: (data: ExamSaveParams) => http.post<Exam>('/exam/save', data),

  /** 发布考试 */
  publish: (id: number) => http.get<void>(`/exam/publish/${id}`),
}
