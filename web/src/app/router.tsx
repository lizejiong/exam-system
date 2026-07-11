import { Routes, Route, Navigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LoginPage } from '../features/user'
import {
  ExamAnalysePage,
  ExamAnswerPage,
  ExamEditPage,
  ExamPage,
} from '../features/exam'
import { isLoggedIn } from '../shared/auth'

function Protected({ children }: { children: ReactNode }) {
  const location = useLocation()
  return isLoggedIn() ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/paper/:id/edit"
        element={
          <Protected>
            <ExamEditPage />
          </Protected>
        }
      />
      <Route
        path="/paper/:id/answer"
        element={
          <Protected>
            <ExamAnswerPage />
          </Protected>
        }
      />
      <Route
        path="/exam/:id/answer"
        element={
          <Protected>
            <ExamAnswerPage />
          </Protected>
        }
      />
      <Route
        path="/paper/:id/analyse"
        element={
          <Protected>
            <ExamAnalysePage />
          </Protected>
        }
      />
      <Route
        path="/"
        element={
          <Protected>
            <ExamPage />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
