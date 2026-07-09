import { http } from '../../shared/request'
import type { LoginParams, LoginResult, RegisterParams } from './types'

export const userApi = {
  /** 发送注册验证码 */
  registerCaptcha: (address: string) =>
    http.get<string>('/user/register-captcha', { address }),

  /** 注册 */
  register: (data: RegisterParams) => http.post('/user/register', data),

  /** 登录，返回 { user, token } */
  login: (data: LoginParams) => http.post<LoginResult>('/user/login', data),
}
