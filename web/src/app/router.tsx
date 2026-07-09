import { Routes, Route, Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { LoginPage } from '../features/user'
import { ExamPage } from '../features/exam'
import { isLoggedIn } from '../shared/auth'

function Protected({ children }: { children: ReactNode }) {
  return isLoggedIn() ? <>{children}</> : <Navigate to="/login" replace />
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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
