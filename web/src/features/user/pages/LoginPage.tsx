import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { userApi } from '../api'
import { setToken, setUser } from '../../../shared/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const sendCaptcha = async () => {
    setMsg('')
    if (!email) {
      setMsg('请先填写邮箱')
      return
    }
    try {
      await userApi.registerCaptcha(email)
      setMsg('验证码已发送至邮箱')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '发送失败')
    }
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMsg('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { user, token } = await userApi.login({ username, password })
        setToken(token)
        setUser(user)
        navigate('/')
      } else {
        await userApi.register({ username, password, email, captcha })
        setMsg('注册成功，请登录')
        setMode('login')
        setCaptcha('')
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={onSubmit}>
        <h1>考试系统</h1>
        <div className="tabs">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            登录
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            注册
          </button>
        </div>

        <label>
          用户名
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label>
          密码
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {mode === 'register' && (
          <>
            <label>
              邮箱
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              验证码
              <div className="captcha-row">
                <input
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                />
                <button type="button" onClick={sendCaptcha}>
                  获取
                </button>
              </div>
            </label>
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? '处理中…' : mode === 'login' ? '登录' : '注册'}
        </button>
        {msg && <p className="msg">{msg}</p>}
      </form>
    </div>
  )
}
