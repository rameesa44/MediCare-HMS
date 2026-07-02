import axios from "axios"
import { API_BASE_URL } from "@/lib/constants"
import { ApiResponse } from "@/types"

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request Interceptor: Inject bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle auto token refresh & formatting errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle token expiration/401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const accessToken = localStorage.getItem("accessToken")
        const refreshToken = localStorage.getItem("refreshToken")

        if (accessToken && refreshToken) {
          // Perform silent refresh
          const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
            `${API_BASE_URL}/auth/refresh-token`,
            { accessToken, refreshToken }
          )

          if (response.data.success && response.data.data) {
            const { accessToken: newAccess, refreshToken: newRefresh } = response.data.data
            localStorage.setItem("accessToken", newAccess)
            localStorage.setItem("refreshToken", newRefresh)

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccess}`
            return apiClient(originalRequest)
          }
        }
      } catch (refreshError) {
        // Refresh token expired or invalid -> log user out
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")
        window.location.href = "/login"
      }
    }

    // Standardize error responses to fit ApiResponse format
    const apiError: ApiResponse = {
      success: false,
      message: error.response?.data?.message || "An unexpected error occurred.",
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors,
    }

    return Promise.reject(apiError)
  }
)

export default apiClient
