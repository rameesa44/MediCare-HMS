namespace HospitalMS.Domain.Interfaces;

/// <summary>
/// Provides access to the currently authenticated user's information.
/// Implemented in the API layer using HttpContext.
/// </summary>
public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    string? Role { get; }
    bool IsAuthenticated { get; }
}
