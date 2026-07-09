// 登录态：token + 当前用户信息存 localStorage

export interface LoginUser {
  id: number
  username: string
  email: string
  createTime: string
}

const TOKEN_KEY = 'exam_token'
const USER_KEY = 'exam_user'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getUser(): LoginUser | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? (JSON.parse(raw) as LoginUser) : null
}

export function setUser(user: LoginUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isLoggedIn(): boolean {
  return !!getToken()
}
