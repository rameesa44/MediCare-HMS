import { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import { AuthProvider } from "@/stores/AuthContext"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { NotFoundPage, UnauthorizedPage } from "@/pages/ErrorPages"

// Lazy-load pages for code splitting / performance
const HomePage = lazy(() => import("@/features/home/pages/HomePage").then(m => ({ default: m.HomePage })))
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage").then(m => ({ default: m.LoginPage })))
const AdminDashboard = lazy(() => import("@/features/admin/pages/AdminDashboard").then(m => ({ default: m.AdminDashboard })))
const DepartmentsPage = lazy(() => import("@/features/admin/pages/DepartmentsPage").then(m => ({ default: m.DepartmentsPage })))
const DoctorsPage = lazy(() => import("@/features/admin/pages/DoctorsPage").then(m => ({ default: m.DoctorsPage })))
const StaffPage = lazy(() => import("@/features/admin/pages/StaffPage").then(m => ({ default: m.StaffPage })))
const PatientsPage = lazy(() => import("@/features/admin/pages/PatientsPage").then(m => ({ default: m.PatientsPage })))
const AppointmentsPage = lazy(() => import("@/features/admin/pages/AppointmentsPage").then(m => ({ default: m.AppointmentsPage })))
const WardsPage = lazy(() => import("@/features/admin/pages/WardsPage").then(m => ({ default: m.WardsPage })))
const BillingPage = lazy(() => import("@/features/admin/pages/BillingPage").then(m => ({ default: m.BillingPage })))
const AuditLogsPage = lazy(() => import("@/features/admin/pages/AuditLogsPage").then(m => ({ default: m.AuditLogsPage })))
const SettingsPage = lazy(() => import("@/features/admin/pages/SettingsPage").then(m => ({ default: m.SettingsPage })))

const DoctorDashboard = lazy(() => import("@/features/doctor/pages/DoctorDashboard").then(m => ({ default: m.DoctorDashboard })))
const ReceptionDashboard = lazy(() => import("@/features/reception/pages/ReceptionDashboard").then(m => ({ default: m.ReceptionDashboard })))
const WardDashboard = lazy(() => import("@/features/ward/pages/WardDashboard").then(m => ({ default: m.WardDashboard })))
const PatientDashboard = lazy(() => import("@/features/patient/pages/PatientDashboard").then(m => ({ default: m.PatientDashboard })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Protected Dashboard Routes — DashboardLayout handles auth redirect */}
                <Route element={<DashboardLayout />}>
                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/departments"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <DepartmentsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/doctors"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <DoctorsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/staff"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <StaffPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/patients"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <PatientsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/appointments"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <AppointmentsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/wards"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <WardsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/billing"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <BillingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/audit-logs"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <AuditLogsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedRoute allowedRoles={["Admin"]}>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Doctor Routes */}
                  <Route
                    path="/doctor"
                    element={
                      <ProtectedRoute allowedRoles={["Doctor"]}>
                        <DoctorDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Receptionist Routes */}
                  <Route
                    path="/receptionist"
                    element={
                      <ProtectedRoute allowedRoles={["Receptionist"]}>
                        <ReceptionDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Ward Staff Routes */}
                  <Route
                    path="/ward-staff"
                    element={
                      <ProtectedRoute allowedRoles={["WardStaff"]}>
                        <WardDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Patient Routes */}
                  <Route
                    path="/patient-portal"
                    element={
                      <ProtectedRoute allowedRoles={["Patient"]}>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>

        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
