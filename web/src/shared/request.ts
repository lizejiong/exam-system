import axios, { type AxiosError, type AxiosResponse } from 'axios'
import { clearAuth, getToken, setToken } from './auth'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const instance = axios.create({
  timeout: 15000,
})

// 请求拦截器：注入 token
instance.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

// 响应拦截器：续期 token、401 跳转、错误提取；直接返回 data
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 后端 AuthGuard 验证通过后会在响应头续期 token
    const newToken = response.headers['token']
    if (typeof newToken === 'string') setToken(newToken)
    return response.data
  },
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status ?? 0
    if (status === 401) {
      clearAuth()
      if (location.pathname !== '/login') location.href = '/login'
    }
    const msg = error.response?.data?.message ?? error.message ?? '请求失败'
    return Promise.reject(new ApiError(status, msg))
  },
)

// 拦截器已把 response.data 透出，故双泛型 R = T，调用方直接拿到业务数据
export const http = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    instance.get<T, T>(url, { params }),
  post: <T>(url: string, data?: unknown) => instance.post<T, T>(url, data),
  put: <T>(url: string, data?: unknown) => instance.put<T, T>(url, data),
  delete: <T>(url: string) => instance.delete<T, T>(url),
}

export default instance
