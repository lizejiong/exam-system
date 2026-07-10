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
    const examName = name.trim()
    if (!examName) return

    setLoading(true)
    setMsg('')
    try {
      const exam = await examApi.add({ name: examName })
      setName('')
      await load()
      navigate(`/exam/${exam.id}/edit`, { state: { exam } })
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '创建失败')
    } finally {
      setLoading(false)
    }
  }

  const onTogglePublish = async (exam: Exam) => {
    const actionText = exam.isPublish ? '取消发布' : '发布'
    if (!confirm(`确定${actionText}「${exam.name}」吗？`)) return

    setMsg('')
    try {
      if (exam.isPublish) {
        await examApi.unpublish(exam.id)
      } else {
        await examApi.publish(exam.id)
      }
      await load()
      setMsg(`${actionText}成功`)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : `${actionText}失败`)
    }
  }

  const onDelete = async (exam: Exam) => {
    if (!confirm(`确定删除「${exam.name}」吗？`)) return

    setMsg('')
    try {
      await examApi.remove(exam.id)
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
        <div>
          <h1>我的考试</h1>
          <p>创建、编辑、发布和管理你的考试。</p>
        </div>
        <div className="user-bar">
          <span>{user?.username}</span>
          <button type="button" onClick={onLogout}>
            退出
          </button>
        </div>
      </header>

      <form className="add-form" onSubmit={onAdd}>
        <input
          placeholder="输入考试名称，例如：前端基础测试"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button disabled={loading}>{loading ? '创建中...' : '新建考试'}</button>
      </form>

      {msg && <p className="msg">{msg}</p>}

      <section className="exam-list-panel">
        <div className="section-title">
          <h2>考试列表</h2>
          <span>{list.length} 个考试</span>
        </div>

        <ul className="exam-list">
          {list.map((exam) => (
            <li key={exam.id} className="exam-card">
              <div className="exam-info">
                <div>
                  <span className="exam-name">{exam.name}</span>
                  <time>
                    更新于 {new Date(exam.updateTime).toLocaleString()}
                  </time>
                </div>
                <em className={exam.isPublish ? 'badge' : 'badge muted'}>
                  {exam.isPublish ? '已发布' : '未发布'}
                </em>
              </div>

              <div className="exam-actions">
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/exam/${exam.id}/edit`, { state: { exam } })
                  }
                >
                  编辑
                </button>
                <button type="button" onClick={() => onTogglePublish(exam)}>
                  {exam.isPublish ? '取消发布' : '发布'}
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => onDelete(exam)}
                >
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>

        {list.length === 0 && (
          <div className="empty">暂无考试，先新建一个考试。</div>
        )}
      </section>
    </div>
  )
}
