import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { DashboardPage } from './pages/DashboardPage'
import { MotorcyclesPage } from './pages/motorcycles/MotorcyclesPage'
import { MotorcycleFormPage } from './pages/motorcycles/MotorcycleFormPage'
import { FuelLogsPage } from './pages/fuel/FuelLogsPage'
import { FuelLogFormPage } from './pages/fuel/FuelLogFormPage'
import { MaintenancePage } from './pages/maintenance/MaintenancePage'
import { MaintenanceFormPage } from './pages/maintenance/MaintenanceFormPage'
import { InsurancePage } from './pages/insurance/InsurancePage'
import { InsuranceFormPage } from './pages/insurance/InsuranceFormPage'
import { ShopsPage } from './pages/shops/ShopsPage'

function App() {
  return (
    <Routes>
      {/* 공개 라우트 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* 보호 라우트 */}
      <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

      <Route path="/motorcycles" element={<ProtectedRoute><MotorcyclesPage /></ProtectedRoute>} />
      <Route path="/motorcycles/new" element={<ProtectedRoute><MotorcycleFormPage /></ProtectedRoute>} />
      <Route path="/motorcycles/:id/edit" element={<ProtectedRoute><MotorcycleFormPage /></ProtectedRoute>} />

      <Route path="/fuel" element={<ProtectedRoute><FuelLogsPage /></ProtectedRoute>} />
      <Route path="/fuel/new" element={<ProtectedRoute><FuelLogFormPage /></ProtectedRoute>} />
      <Route path="/fuel/:id/edit" element={<ProtectedRoute><FuelLogFormPage /></ProtectedRoute>} />

      <Route path="/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
      <Route path="/maintenance/new" element={<ProtectedRoute><MaintenanceFormPage /></ProtectedRoute>} />
      <Route path="/maintenance/:id/edit" element={<ProtectedRoute><MaintenanceFormPage /></ProtectedRoute>} />

      <Route path="/more" element={<ProtectedRoute><InsurancePage /></ProtectedRoute>} />
      <Route path="/more/new" element={<ProtectedRoute><InsuranceFormPage /></ProtectedRoute>} />
      <Route path="/more/:id/edit" element={<ProtectedRoute><InsuranceFormPage /></ProtectedRoute>} />

      <Route path="/shops" element={<ProtectedRoute><ShopsPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
