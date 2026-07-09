import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { examApi } from '../api'
import type { Exam } from '../types'
import { clearAuth, getUser } from '../../../shared/auth'

export default function ExamPage() {
  const navigate = useNavigate()
  const user = getUser()
  const [list, setList] = useState<Exam[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    try {
      setList(await examApi.list())
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '加载失败')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onAdd = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setMsg('')
    try {
      await examApi.add({ name: name.trim() })
      setName('')
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '创建失败')
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async (id: number) => {
    if (!confirm('确定删除该考试？')) return
    setMsg('')
    try {
      await examApi.remove(id)
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '删除失败')
    }
  }

  const onLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <div className="exam-page">
      <header>
        <h1>我的考试</h1>
        <div className="user-bar">
          <span>{user?.username}</span>
          <button onClick={onLogout}>退出</button>
        </div>
      </header>

      <form className="add-form" onSubmit={onAdd}>
        <input
          placeholder="考试名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button disabled={loading}>新建</button>
      </form>

      {msg && <p className="msg">{msg}</p>}

      <ul className="exam-list">
        {list.map((exam) => (
          <li key={exam.id}>
            <div className="exam-info">
              <span className="exam-name">{exam.name}</span>
              {exam.isPublish && <em className="badge">已发布</em>}
              <time>{new Date(exam.createTime).toLocaleString()}</time>
            </div>
            <button className="danger" onClick={() => onDelete(exam.id)}>
              删除
            </button>
          </li>
        ))}
        {list.length === 0 && <p className="empty">暂无考试</p>}
      </ul>
    </div>
  )
}
