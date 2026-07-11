import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { analyseApi, answerApi } from '../api'
import type { AnswerAnalyseResult, ExamRankingResult } from '../types'

export default function ExamAnalysePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState<AnswerAnalyseResult | null>(null)
  const [ranking, setRanking] = useState<ExamRankingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const examId = Number(id)
    if (!Number.isInteger(examId)) {
      setMsg('无效的考试 id')
      return
    }

    setLoading(true)
    setMsg('')
    Promise.all([answerApi.analyse(examId), analyseApi.ranking(examId)])
      .then(([analyseData, rankingData]) => {
        setData(analyseData)
        setRanking(rankingData)
      })
      .catch((e) => {
        setMsg(e instanceof Error ? e.message : '加载分析失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  return (
    <div className="analyse-page">
      <header className="answer-header">
        <button type="button" onClick={() => navigate('/')}>
          返回
        </button>
        <div>
          <h1>{data?.exam.name ?? '考试分析'}</h1>
          <p>{loading ? '正在加载分析数据...' : '查看成绩、题目正确率和排行榜。'}</p>
        </div>
      </header>

      {msg && <p className="msg">{msg}</p>}

      {data && (
        <>
          <section className="analyse-stats">
            <div>
              <span>提交次数</span>
              <strong>{data.totalSubmit}</strong>
            </div>
            <div>
              <span>平均分</span>
              <strong>
                {data.averageScore} / {data.totalScore}
              </strong>
            </div>
            <div>
              <span>最高分</span>
              <strong>{data.maxScore}</strong>
            </div>
            <div>
              <span>最低分</span>
              <strong>{data.minScore}</strong>
            </div>
          </section>

          <section className="analyse-panel">
            <h2>排行榜</h2>
            {!ranking || ranking.list.length === 0 ? (
              <div className="empty">暂无排行数据，提交答卷后会自动生成。</div>
            ) : (
              <div className="ranking-list">
                {ranking.list.map((item) => (
                  <div className="ranking-row" key={item.userId}>
                    <strong>{item.rank}</strong>
                    <span>{item.username}</span>
                    <em>
                      {item.score} / {item.totalScore}
                    </em>
                    <time>
                      {item.createTime
                        ? new Date(item.createTime).toLocaleString()
                        : '-'}
                    </time>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="analyse-panel">
            <h2>题目正确率</h2>
            {data.questions.length === 0 ? (
              <div className="empty">暂无题目统计。</div>
            ) : (
              data.questions.map((question) => (
                <div className="question-stat" key={question.index}>
                  <div>
                    <strong>
                      {question.index + 1}. {question.question}
                    </strong>
                    <span>
                      {question.correctCount} / {question.totalCount} 人答对
                    </span>
                  </div>
                  <progress value={question.correctRate} max={1} />
                  <em>{Math.round(question.correctRate * 100)}%</em>
                </div>
              ))
            )}
          </section>

          <section className="analyse-panel">
            <h2>提交记录</h2>
            {data.records.length === 0 ? (
              <div className="empty">暂无提交记录。</div>
            ) : (
              <table className="records-table">
                <thead>
                  <tr>
                    <th>用户</th>
                    <th>分数</th>
                    <th>提交时间</th>
                  </tr>
                </thead>
                <tbody>
                  {data.records.map((record) => (
                    <tr key={record.id}>
                      <td>{record.answerer.username}</td>
                      <td>
                        {record.score} / {record.totalScore}
                      </td>
                      <td>{new Date(record.createTime).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  )
}
