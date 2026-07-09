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
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [editName, setEditName] = useState('')
  const [editContent, setEditContent] = useState('')
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
      openEditor(exam)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '创建失败')
    } finally {
      setLoading(false)
    }
  }

  const openEditor = (exam: Exam) => {
    setEditingExam(exam)
    setEditName(exam.name)
    setEditContent(exam.content)
    setMsg('')
  }

  const closeEditor = () => {
    setEditingExam(null)
    setEditName('')
    setEditContent('')
  }

  const onSave = async () => {
    if (!editingExam) return

    const nextName = editName.trim()
    if (!nextName) {
      setMsg('考试名称不能为空')
      return
    }

    setLoading(true)
    setMsg('')
    try {
      const saved = await examApi.save({
        id: editingExam.id,
        name: nextName,
        content: editContent,
      })
      setEditingExam(saved)
      await load()
      setMsg('保存成功')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '保存失败')
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
      if (editingExam?.id === exam.id) closeEditor()
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

      <section className="exam-workspace">
        <div className="exam-list-panel">
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
                  <button type="button" onClick={() => openEditor(exam)}>
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
        </div>

        <aside className="editor-panel">
          {editingExam ? (
            <>
              <div className="section-title">
                <h2>编辑考试</h2>
                <button type="button" onClick={closeEditor}>
                  关闭
                </button>
              </div>

              <label>
                考试名称
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </label>

              <label>
                考试内容
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="这里先填写考试说明或题目草稿，后续可以升级为题目编辑器。"
                />
              </label>

              <button type="button" disabled={loading} onClick={onSave}>
                {loading ? '保存中...' : '保存'}
              </button>
            </>
          ) : (
            <div className="editor-empty">
              <h2>选择一个考试进行编辑</h2>
              <p>新建考试后也会自动打开编辑区域。</p>
            </div>
          )}
        </aside>
      </section>
    </div>
  )
}
