import type { LoginUser } from '../../shared/auth'

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  password: string
  email: string
  captcha: string
}

export interface LoginResult {
  user: LoginUser
  token: string
}
