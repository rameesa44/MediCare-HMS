using Microsoft.AspNetCore.Mvc;
using HospitalMS.Application.Common;

namespace HospitalMS.Api.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
    protected ActionResult<ApiResponse<T>> OkResponse<T>(T data, string message = "Success")
    {
        var response = ApiResponse<T>.SuccessResponse(data, message, StatusCodes.Status200OK);
        return Ok(response);
    }

    protected ActionResult<ApiResponse<T>> CreatedResponse<T>(T data, string message = "Created")
    {
        var response = ApiResponse<T>.SuccessResponse(data, message, StatusCodes.Status201Created);
        return StatusCode(StatusCodes.Status201Created, response);
    }

    protected ActionResult<ApiResponse> OkResponse(string message = "Success")
    {
        var response = ApiResponse.Ok(message);
        return Ok(response);
    }

    protected ActionResult<ApiResponse> ErrorResponse(string message, int statusCode = StatusCodes.Status400BadRequest)
    {
        var response = ApiResponse.Error(message, statusCode);
        return StatusCode(statusCode, response);
    }
}
