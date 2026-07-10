import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { examApi } from '../api'
import type { Exam, ExamQuestion, ExamQuestionType } from '../types'

const MATERIAL_TYPE = 'question-material'
const QUESTION_TYPE = 'question-card'

interface LocationState {
  exam?: Exam
}

interface MaterialItem {
  type: ExamQuestionType
}

interface QuestionDragItem {
  id: string
  index: number
}

interface DraftQuestion extends ExamQuestion {
  id: string
}

const materialList: Array<{
  type: ExamQuestionType
  title: string
  description: string
}> = [
  {
    type: 'radio',
    title: '单选题',
    description: '多个选项中选择一个正确答案',
  },
  {
    type: 'checkbox',
    title: '多选题',
    description: '多个选项中选择多个正确答案',
  },
  {
    type: 'blank',
    title: '填空题',
    description: '填写一个标准答案',
  },
]

function createQuestion(type: ExamQuestionType): DraftQuestion {
  if (type === 'blank') {
    return {
      id: crypto.randomUUID(),
      type,
      question: '请填写题干',
      options: [],
      score: 5,
      answer: '标准答案',
      answerAnalyse: '答案解析',
    }
  }

  if (type === 'checkbox') {
    return {
      id: crypto.randomUUID(),
      type,
      question: '请选择正确选项',
      options: ['选项1', '选项2', '选项3'],
      score: 5,
      answer: ['选项1', '选项2'],
      answerAnalyse: '答案解析',
    }
  }

  return {
    id: crypto.randomUUID(),
    type,
    question: '请选择正确选项',
    options: ['选项1', '选项2'],
    score: 5,
    answer: '选项1',
    answerAnalyse: '答案解析',
  }
}

function isQuestionType(value: unknown): value is ExamQuestionType {
  return value === 'radio' || value === 'checkbox' || value === 'blank'
}

function normalizeQuestion(value: unknown): DraftQuestion | null {
  if (!value || typeof value !== 'object') return null

  const item = value as Partial<ExamQuestion>
  if (!isQuestionType(item.type)) return null

  const fallback = createQuestion(item.type)
  const options =
    item.type === 'blank'
      ? []
      : Array.isArray(item.options)
        ? item.options.filter((option): option is string => typeof option === 'string')
        : fallback.options

  return {
    id: crypto.randomUUID(),
    type: item.type,
    question: typeof item.question === 'string' ? item.question : fallback.question,
    options,
    score: typeof item.score === 'number' ? item.score : fallback.score,
    answer:
      item.type === 'checkbox'
        ? Array.isArray(item.answer)
          ? item.answer.filter((answer): answer is string => typeof answer === 'string')
          : fallback.answer
        : typeof item.answer === 'string'
          ? item.answer
          : fallback.answer,
    answerAnalyse:
      typeof item.answerAnalyse === 'string'
        ? item.answerAnalyse
        : fallback.answerAnalyse,
  }
}

function parseExamContent(content: string): DraftQuestion[] {
  if (!content.trim()) return []

  try {
    const parsed = JSON.parse(content) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((item) => normalizeQuestion(item))
      .filter((item): item is DraftQuestion => item !== null)
  } catch {
    return []
  }
}

function serializeQuestions(questions: DraftQuestion[]): ExamQuestion[] {
  return questions.map(({ id: _, ...question }) => question)
}

function cloneQuestion(question: DraftQuestion): DraftQuestion {
  return {
    ...question,
    id: crypto.randomUUID(),
    options: [...question.options],
    answer: Array.isArray(question.answer) ? [...question.answer] : question.answer,
  }
}

function QuestionMaterial({
  type,
  title,
  description,
}: {
  type: ExamQuestionType
  title: string
  description: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [{ isDragging }, drag] = useDrag(() => ({
    type: MATERIAL_TYPE,
    item: { type } satisfies MaterialItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  drag(ref)

  return (
    <div
      ref={ref}
      className={`material-card ${isDragging ? 'dragging' : ''}`}
    >
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  )
}

function QuestionCard({
  question,
  index,
  selected,
  onSelect,
  onMove,
  onCopy,
  onDelete,
}: {
  question: DraftQuestion
  index: number
  selected: boolean
  onSelect: () => void
  onMove: (fromIndex: number, toIndex: number) => void
  onCopy: () => void
  onDelete: () => void
}) {
  const ref = useRef<HTMLElement>(null)
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: QUESTION_TYPE,
      item: { id: question.id, index } satisfies QuestionDragItem,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [question.id, index],
  )
  const [, drop] = useDrop<QuestionDragItem>(
    () => ({
      accept: QUESTION_TYPE,
      hover: (item) => {
        if (item.index === index) return
        onMove(item.index, index)
        item.index = index
      },
    }),
    [index, onMove],
  )

  drag(drop(ref))

  const typeText =
    question.type === 'radio'
      ? '单选题'
      : question.type === 'checkbox'
        ? '多选题'
        : '填空题'

  return (
    <article
      ref={ref}
      className={`question-preview ${selected ? 'active' : ''} ${
        isDragging ? 'sorting' : ''
      }`}
      onClick={onSelect}
    >
      <div className="question-toolbar">
        <div className="question-preview-title">
          <span>Q{index + 1}</span>
          <strong>{question.question || '未填写题干'}</strong>
        </div>
        <div className="question-card-actions">
          <em>{typeText}</em>
          <button type="button" onClick={onCopy}>
            复制
          </button>
          <button type="button" onClick={onDelete}>
            删除
          </button>
        </div>
      </div>

      {question.type === 'blank' ? (
        <div className="blank-preview">填空作答区</div>
      ) : (
        <ul>
          {question.options.map((option) => (
            <li key={option}>
              <span className={question.type === 'checkbox' ? 'square' : ''} />
              {option || '未填写选项'}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

function CanvasDropZone({
  questions,
  selectedId,
  onAddQuestion,
  onSelectQuestion,
  onMoveQuestion,
  onCopyQuestion,
  onDeleteQuestion,
}: {
  questions: DraftQuestion[]
  selectedId: string | null
  onAddQuestion: (type: ExamQuestionType) => void
  onSelectQuestion: (id: string) => void
  onMoveQuestion: (fromIndex: number, toIndex: number) => void
  onCopyQuestion: (id: string) => void
  onDeleteQuestion: (id: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [{ isOver }, drop] = useDrop(() => ({
    accept: MATERIAL_TYPE,
    drop: (item: MaterialItem) => onAddQuestion(item.type),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  drop(ref)

  return (
    <main ref={ref} className={`editor-canvas ${isOver ? 'drag-over' : ''}`}>
      <div className="canvas-title">
        <h2>试卷画布</h2>
        <span>拖拽题型添加，拖拽题目排序</span>
      </div>

      {questions.length === 0 ? (
        <div className="canvas-empty">
          <h2>把左侧题型拖到这里</h2>
          <p>先搭建题目结构，然后点击右上角保存。</p>
        </div>
      ) : (
        questions.map((item, index) => (
          <QuestionCard
            key={item.id}
            question={item}
            index={index}
            selected={selectedId === item.id}
            onSelect={() => onSelectQuestion(item.id)}
            onMove={onMoveQuestion}
            onCopy={() => onCopyQuestion(item.id)}
            onDelete={() => onDeleteQuestion(item.id)}
          />
        ))
      )}
    </main>
  )
}

function PreviewModal({
  title,
  questions,
  onClose,
}: {
  title: string
  questions: ExamQuestion[]
  onClose: () => void
}) {
  return (
    <div className="preview-mask" role="dialog" aria-modal="true">
      <div className="preview-modal">
        <header>
          <div>
            <h2>{title}</h2>
            <p>考生预览视图，仅用于检查题目展示效果。</p>
          </div>
          <button type="button" onClick={onClose}>
            关闭
          </button>
        </header>

        <div className="preview-body">
          {questions.length === 0 ? (
            <div className="empty">暂无题目</div>
          ) : (
            questions.map((question, index) => (
              <section className="preview-question" key={`${question.type}-${index}`}>
                <div className="preview-question-title">
                  <strong>
                    {index + 1}. {question.question || '未填写题干'}
                  </strong>
                  <span>{question.score} 分</span>
                </div>

                {question.type === 'blank' ? (
                  <input placeholder="请输入答案" />
                ) : (
                  <div className="preview-options">
                    {question.options.map((option) => (
                      <label key={option}>
                        <input
                          type={question.type === 'radio' ? 'radio' : 'checkbox'}
                          name={`preview-question-${index}`}
                        />
                        {option || '未填写选项'}
                      </label>
                    ))}
                  </div>
                )}
              </section>
            ))
          )}
        </div>

        <footer>
          <button type="button" onClick={onClose}>
            结束预览
          </button>
        </footer>
      </div>
    </div>
  )
}

function ExamEditInner() {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const initialExam = ((location.state ?? {}) as LocationState).exam ?? null
  const [exam, setExam] = useState<Exam | null>(initialExam)
  const [questions, setQuestions] = useState<DraftQuestion[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    const examId = Number(id)
    if (!Number.isInteger(examId)) {
      setMsg('无效的考试 id')
      return
    }

    setLoading(true)
    setMsg('')
    examApi
      .find(examId)
      .then((data) => {
        setExam(data)
        const nextQuestions = parseExamContent(data.content)
        setQuestions(nextQuestions)
        setSelectedId(nextQuestions[0]?.id ?? null)
      })
      .catch((e) => {
        setMsg(e instanceof Error ? e.message : '加载考试失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  const selectedQuestion =
    questions.find((question) => question.id === selectedId) ?? null

  const updateSelectedQuestion = (patch: Partial<ExamQuestion>) => {
    if (!selectedId) return

    setQuestions((current) =>
      current.map((question) =>
        question.id === selectedId ? { ...question, ...patch } : question,
      ),
    )
  }

  const addQuestion = (type: ExamQuestionType) => {
    const question = createQuestion(type)
    setQuestions((current) => [...current, question])
    setSelectedId(question.id)
  }

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    setQuestions((current) => {
      const next = [...current]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  const copyQuestion = (questionId: string) => {
    setQuestions((current) => {
      const index = current.findIndex((question) => question.id === questionId)
      if (index === -1) return current

      const copy = cloneQuestion(current[index])
      const next = [...current]
      next.splice(index + 1, 0, copy)
      setSelectedId(copy.id)
      return next
    })
  }

  const deleteQuestion = (questionId: string) => {
    setQuestions((current) =>
      current.filter((question) => question.id !== questionId),
    )

    if (selectedId === questionId) {
      setSelectedId(null)
    }
  }

  const updateOption = (index: number, value: string) => {
    if (!selectedQuestion) return

    const oldOption = selectedQuestion.options[index]
    const nextOptions = [...selectedQuestion.options]
    nextOptions[index] = value

    if (selectedQuestion.type === 'checkbox') {
      const currentAnswer = Array.isArray(selectedQuestion.answer)
        ? selectedQuestion.answer
        : []

      updateSelectedQuestion({
        options: nextOptions,
        answer: currentAnswer.map((answer) =>
          answer === oldOption ? value : answer,
        ),
      })
      return
    }

    updateSelectedQuestion({
      options: nextOptions,
      answer:
        selectedQuestion.answer === oldOption ? value : selectedQuestion.answer,
    })
  }

  const addOption = () => {
    if (!selectedQuestion || selectedQuestion.type === 'blank') return

    updateSelectedQuestion({
      options: [
        ...selectedQuestion.options,
        `选项${selectedQuestion.options.length + 1}`,
      ],
    })
  }

  const removeOption = (index: number) => {
    if (
      !selectedQuestion ||
      selectedQuestion.type === 'blank' ||
      selectedQuestion.options.length <= 2
    ) {
      return
    }

    const removedOption = selectedQuestion.options[index]
    const nextOptions = selectedQuestion.options.filter((_, i) => i !== index)

    if (selectedQuestion.type === 'checkbox') {
      const currentAnswer = Array.isArray(selectedQuestion.answer)
        ? selectedQuestion.answer
        : []

      updateSelectedQuestion({
        options: nextOptions,
        answer: currentAnswer.filter((answer) => answer !== removedOption),
      })
      return
    }

    updateSelectedQuestion({
      options: nextOptions,
      answer:
        selectedQuestion.answer === removedOption
          ? nextOptions[0]
          : selectedQuestion.answer,
    })
  }

  const toggleCheckboxAnswer = (option: string, checked: boolean) => {
    if (!selectedQuestion || selectedQuestion.type !== 'checkbox') return

    const currentAnswer = Array.isArray(selectedQuestion.answer)
      ? selectedQuestion.answer
      : []

    updateSelectedQuestion({
      answer: checked
        ? [...currentAnswer, option]
        : currentAnswer.filter((answer) => answer !== option),
    })
  }

  const onSave = async () => {
    const examId = Number(id)
    if (!Number.isInteger(examId)) return

    setSaving(true)
    setMsg('')
    try {
      const saved = await examApi.save({
        id: examId,
        name: exam?.name,
        content: JSON.stringify(serializeQuestions(questions)),
      })
      setExam(saved)
      setMsg('保存成功')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const previewData = serializeQuestions(questions)

  return (
    <div className="exam-editor-page">
      <header className="editor-header">
        <div>
          <button type="button" onClick={() => navigate('/')}>
            返回
          </button>
          <div>
            <h1>{exam?.name ?? `考试 ${id ?? ''}`}</h1>
            <p>{loading ? '正在加载考试...' : '编辑完成后点击保存写入后端。'}</p>
          </div>
        </div>

        <div className="editor-actions">
          <button type="button" onClick={() => setPreviewOpen(true)}>
            预览
          </button>
          <button type="button" disabled={saving || loading} onClick={onSave}>
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </header>

      {msg && <p className="msg editor-message">{msg}</p>}

      <section className="exam-editor-layout">
        <aside className="material-panel">
          <h2>题型物料</h2>
          {materialList.map((material) => (
            <QuestionMaterial key={material.type} {...material} />
          ))}
        </aside>

        <CanvasDropZone
          questions={questions}
          selectedId={selectedId}
          onAddQuestion={addQuestion}
          onSelectQuestion={setSelectedId}
          onMoveQuestion={moveQuestion}
          onCopyQuestion={copyQuestion}
          onDeleteQuestion={deleteQuestion}
        />

        <aside className="config-panel">
          <h2>题目配置</h2>

          {selectedQuestion ? (
            <div className="config-form">
              <label>
                题干
                <textarea
                  value={selectedQuestion.question}
                  onChange={(e) =>
                    updateSelectedQuestion({ question: e.target.value })
                  }
                />
              </label>

              <label>
                分值
                <input
                  type="number"
                  min="0"
                  value={selectedQuestion.score}
                  onChange={(e) =>
                    updateSelectedQuestion({ score: Number(e.target.value) })
                  }
                />
              </label>

              {selectedQuestion.type !== 'blank' && (
                <div className="option-config">
                  <div className="section-title">
                    <h3>选项</h3>
                    <button type="button" onClick={addOption}>
                      添加
                    </button>
                  </div>

                  {selectedQuestion.options.map((option, index) => (
                    <div
                      className="option-row"
                      key={`${selectedQuestion.id}-${index}`}
                    >
                      <input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                      />
                      <button type="button" onClick={() => removeOption(index)}>
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedQuestion.type === 'radio' && (
                <label>
                  正确答案
                  <select
                    value={String(selectedQuestion.answer)}
                    onChange={(e) =>
                      updateSelectedQuestion({ answer: e.target.value })
                    }
                  >
                    {selectedQuestion.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {selectedQuestion.type === 'checkbox' && (
                <div className="answer-checkbox-list">
                  <h3>正确答案</h3>
                  {selectedQuestion.options.map((option) => {
                    const answer = Array.isArray(selectedQuestion.answer)
                      ? selectedQuestion.answer
                      : []

                    return (
                      <label key={option}>
                        <input
                          type="checkbox"
                          checked={answer.includes(option)}
                          onChange={(e) =>
                            toggleCheckboxAnswer(option, e.target.checked)
                          }
                        />
                        {option}
                      </label>
                    )
                  })}
                </div>
              )}

              {selectedQuestion.type === 'blank' && (
                <label>
                  标准答案
                  <input
                    value={String(selectedQuestion.answer)}
                    onChange={(e) =>
                      updateSelectedQuestion({ answer: e.target.value })
                    }
                  />
                </label>
              )}

              <label>
                答案解析
                <textarea
                  value={selectedQuestion.answerAnalyse}
                  onChange={(e) =>
                    updateSelectedQuestion({ answerAnalyse: e.target.value })
                  }
                />
              </label>

              <button
                type="button"
                className="danger-outline"
                onClick={() => deleteQuestion(selectedQuestion.id)}
              >
                删除题目
              </button>
            </div>
          ) : (
            <div className="config-empty">
              <p>选择画布中的题目后，在这里配置题干、选项、分值和答案。</p>
            </div>
          )}
        </aside>
      </section>

      {previewOpen && (
        <PreviewModal
          title={exam?.name ?? `考试 ${id ?? ''}`}
          questions={previewData}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  )
}

export default function ExamEditPage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ExamEditInner />
    </DndProvider>
  )
}
