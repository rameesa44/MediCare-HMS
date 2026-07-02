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
