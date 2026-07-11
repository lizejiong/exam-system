import axios, { type AxiosError, type AxiosResponse } from 'axios'
import { clearAuth, getToken, setToken } from './auth'

interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
}

interface ApiErrorEnvelope {
  code?: number
  message?: string | string[]
  path?: string
  timestamp?: string
}

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

instance.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

instance.interceptors.response.use(
  (response: AxiosResponse): any => {
    const newToken = response.headers['token']
    if (typeof newToken === 'string') setToken(newToken)

    const body = response.data as ApiEnvelope<unknown> | unknown
    if (isApiEnvelope(body)) {
      if (body.code !== 0) {
        return Promise.reject(
          new ApiError(response.status, normalizeMessage(body.message) ?? '请求失败'),
        )
      }
      return body.data
    }

    return body
  },
  (error: AxiosError<ApiErrorEnvelope>) => {
    const status = error.response?.status ?? 0
    if (status === 401) {
      clearAuth()
      if (location.pathname !== '/login') location.href = '/login'
    }

    const msg =
      normalizeMessage(error.response?.data?.message) ??
      error.message ??
      '请求失败'
    return Promise.reject(new ApiError(status, msg))
  },
)

function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return (
    !!value &&
    typeof value === 'object' &&
    'code' in value &&
    'message' in value &&
    'data' in value
  )
}

function normalizeMessage(message: string | string[] | undefined) {
  if (Array.isArray(message)) return message.join('; ')
  return message
}

export const http = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    instance.get<T, T>(url, { params }),
  post: <T>(url: string, data?: unknown) => instance.post<T, T>(url, data),
  put: <T>(url: string, data?: unknown) => instance.put<T, T>(url, data),
  delete: <T>(url: string) => instance.delete<T, T>(url),
}

export default instance
