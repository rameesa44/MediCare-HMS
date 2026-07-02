using System.Text.Json;
using HospitalMS.Application.Common;
using HospitalMS.Domain.Exceptions;

namespace HospitalMS.Api.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var statusCode = StatusCodes.Status500InternalServerError;
        var message = "An internal server error occurred.";
        IDictionary<string, string[]>? errors = null;

        switch (exception)
        {
            case BadRequestException badRequestEx:
                statusCode = StatusCodes.Status400BadRequest;
                message = badRequestEx.Message;
                errors = badRequestEx.Errors;
                break;

            case NotFoundException notFoundEx:
                statusCode = StatusCodes.Status404NotFound;
                message = notFoundEx.Message;
                break;

            case ForbiddenException forbiddenEx:
                statusCode = StatusCodes.Status403Forbidden;
                message = forbiddenEx.Message;
                break;

            case ConflictException conflictEx:
                statusCode = StatusCodes.Status409Conflict;
                message = conflictEx.Message;
                break;

            case DomainException domainEx:
                statusCode = StatusCodes.Status400BadRequest;
                message = domainEx.Message;
                break;
        }

        context.Response.StatusCode = statusCode;

        var response = ApiResponse<object>.ErrorResponse(message, statusCode, errors);
        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var jsonResponse = JsonSerializer.Serialize(response, jsonOptions);

        await context.Response.WriteAsync(jsonResponse);
    }
}
