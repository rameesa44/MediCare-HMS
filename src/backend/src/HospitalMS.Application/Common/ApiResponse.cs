namespace HospitalMS.Application.Common;

/// <summary>
/// Standardized API response wrapper. All API endpoints return this format.
/// Provides consistent structure for success/error responses.
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public IDictionary<string, string[]>? Errors { get; set; }
    public int StatusCode { get; set; }

    public static ApiResponse<T> SuccessResponse(T data, string message = "Success", int statusCode = 200)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data,
            StatusCode = statusCode
        };
    }

    public static ApiResponse<T> ErrorResponse(string message, int statusCode = 400, IDictionary<string, string[]>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            StatusCode = statusCode,
            Errors = errors
        };
    }
}

/// <summary>
/// Non-generic version for responses without data payload.
/// </summary>
public class ApiResponse : ApiResponse<object>
{
    public static ApiResponse Ok(string message = "Success")
    {
        return new ApiResponse
        {
            Success = true,
            Message = message,
            StatusCode = 200
        };
    }

    public static ApiResponse Error(string message, int statusCode = 400)
    {
        return new ApiResponse
        {
            Success = false,
            Message = message,
            StatusCode = statusCode
        };
    }
}
