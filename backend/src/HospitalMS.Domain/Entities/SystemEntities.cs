using HospitalMS.Domain.Common;

namespace HospitalMS.Domain.Entities;

/// <summary>
/// Audit log tracking all data modifications in the system.
/// </summary>
public class AuditLog : BaseEntity
{
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string? EntityId { get; set; }
    public string? OldValues { get; set; }
    public string? NewValues { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}

/// <summary>
/// Hospital configuration settings (key-value pairs).
/// </summary>
public class HospitalSetting : BaseEntity
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string? Description { get; set; }
}

/// <summary>
/// News/blog article for the hospital website.
/// </summary>
public class News : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Summary { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsPublished { get; set; } = false;
    public DateTime? PublishedAt { get; set; }
    public string? Author { get; set; }
}

/// <summary>
/// Patient testimonial for the hospital website.
/// </summary>
public class Testimonial : BaseEntity
{
    public string PatientName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int Rating { get; set; } = 5;
    public bool IsApproved { get; set; } = false;
    public string? PatientImageUrl { get; set; }
}

/// <summary>
/// Contact form submission from the hospital website.
/// </summary>
public class ContactMessage : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public string? RepliedBy { get; set; }
    public DateTime? RepliedAt { get; set; }
}
