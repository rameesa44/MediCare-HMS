using HospitalMS.Domain.Common;
using HospitalMS.Domain.Enums;

namespace HospitalMS.Domain.Entities;

/// <summary>
/// Core user entity for authentication and authorization.
/// Maps to all staff members and patients in the system.
/// </summary>
public class User : BaseEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? ProfileImageUrl { get; set; }
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;
    public bool EmailConfirmed { get; set; } = false;

    // Password reset
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiry { get; set; }

    // Refresh token for JWT
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    // Last login tracking
    public DateTime? LastLoginAt { get; set; }

    // Computed
    public string FullName => $"{FirstName} {LastName}";

    // Navigation properties
    public Doctor? Doctor { get; set; }
    public Patient? Patient { get; set; }
    public Staff? Staff { get; set; }
    public ICollection<Notification> Notifications { get; set; } = [];
    public ICollection<AuditLog> AuditLogs { get; set; } = [];
}
