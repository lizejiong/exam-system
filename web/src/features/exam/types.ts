export interface Exam {
  id: number
  name: string
  content: string
  createUserId: number
  isDelete: boolean
  isPublish: boolean
  createTime: string
}

export interface ExamAddParams {
  name: string
}

export interface ExamSaveParams {
  id: number
  content: string
}
