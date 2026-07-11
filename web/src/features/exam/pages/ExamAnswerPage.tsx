import { useEffect, useState, type FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import { answerApi, examApi } from '../api'
import type {
  AnswerContent,
  AnswerExamQuestion,
  AnswerSubmitResult,
  Exam,
  UserAnswer,
} from '../types'

function parseQuestions(content: string): AnswerExamQuestion[] {
  if (!content.trim()) return []

  try {
    const parsed = JSON.parse(content) as unknown
    return Array.isArray(parsed) ? (parsed as AnswerExamQuestion[]) : []
  } catch {
    return []
  }
}

function formatAnswer(answer: UserAnswer) {
  return Array.isArray(answer) ? answer.join('、') : answer || '未作答'
}

export default function ExamAnswerPage() {
  const { id } = useParams()
  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<AnswerExamQuestion[]>([])
  const [answers, setAnswers] = useState<AnswerContent>({})
  const [result, setResult] = useState<AnswerSubmitResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const examId = Number(id)
    if (!Number.isInteger(examId)) {
      setMsg('无效的考试 id')
      return
    }

    setLoading(true)
    setMsg('')
    examApi
      .answer(examId)
      .then((data) => {
        setExam(data)
        setQuestions(parseQuestions(data.content))
      })
      .catch((e) => {
        setMsg(e instanceof Error ? e.message : '加载考试失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  const setAnswer = (index: number, answer: UserAnswer) => {
    setAnswers((current) => ({
      ...current,
      [index]: answer,
    }))
  }

  const toggleCheckbox = (index: number, option: string, checked: boolean) => {
    const current = answers[String(index)]
    const currentList = Array.isArray(current) ? current : []
    setAnswer(
      index,
      checked
        ? [...currentList, option]
        : currentList.filter((item) => item !== option),
    )
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const examId = Number(id)
    if (!Number.isInteger(examId)) return

    setSubmitting(true)
    setMsg('')
    try {
      const data = await answerApi.submit({
        examId,
        answers,
      })
      setResult(data)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '提交失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="answer-page">
      <header className="answer-header">
        <div>
          <h1>{exam?.name ?? '考试'}</h1>
          <p>{loading ? '正在加载考试...' : '完成作答后提交，系统会自动判卷。'}</p>
        </div>
      </header>

      {msg && <p className="msg">{msg}</p>}

      {result && (
        <section className="answer-score-panel">
          <span>本次得分</span>
          <strong>
            {result.score} / {result.totalScore}
          </strong>
          <p>下面是每题判卷结果、正确答案和答案解析。</p>
        </section>
      )}

      <form className="answer-paper" onSubmit={onSubmit}>
        {questions.map((question, index) => (
          <section className="answer-question" key={`${question.type}-${index}`}>
            <div className="answer-question-title">
              <strong>
                {index + 1}. {question.question || '未填写题干'}
              </strong>
              <span>{question.score} 分</span>
            </div>

            {question.type === 'blank' ? (
              <input
                disabled={!!result}
                value={String(answers[String(index)] ?? '')}
                placeholder="请输入答案"
                onChange={(e) => setAnswer(index, e.target.value)}
              />
            ) : (
              <div className="answer-options">
                {question.options.map((option) => {
                  const answer = answers[String(index)]
                  const checked =
                    question.type === 'checkbox'
                      ? Array.isArray(answer) && answer.includes(option)
                      : answer === option

                  return (
                    <label key={option}>
                      <input
                        disabled={!!result}
                        type={question.type === 'radio' ? 'radio' : 'checkbox'}
                        name={`question-${index}`}
                        checked={checked}
                        onChange={(e) => {
                          if (question.type === 'checkbox') {
                            toggleCheckbox(index, option, e.target.checked)
                            return
                          }
                          setAnswer(index, option)
                        }}
                      />
                      {option}
                    </label>
                  )
                })}
              </div>
            )}

            {result && (
              <div
                className={`answer-detail ${
                  result.detail[index]?.isCorrect ? 'correct' : 'wrong'
                }`}
              >
                <b>{result.detail[index]?.isCorrect ? '回答正确' : '回答错误'}</b>
                <span>
                  你的答案：{formatAnswer(result.detail[index]?.userAnswer ?? '')}
                </span>
                <span>
                  正确答案：{formatAnswer(result.detail[index]?.correctAnswer ?? '')}
                </span>
                <p>解析：{result.detail[index]?.answerAnalyse || '暂无解析'}</p>
              </div>
            )}
          </section>
        ))}

        {questions.length === 0 && !loading && (
          <div className="empty">这个考试还没有题目。</div>
        )}

        {!result && questions.length > 0 && (
          <button className="answer-submit" type="submit" disabled={submitting}>
            {submitting ? '提交中...' : '提交试卷'}
          </button>
        )}
      </form>
    </div>
  )
}
