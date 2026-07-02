using HospitalMS.Domain.Enums;

namespace HospitalMS.Application.DTOs.Doctor;

public class DoctorDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? ProfileImage { get; set; }
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public string? Qualification { get; set; }
    public int ExperienceYears { get; set; }
    public decimal ConsultationFee { get; set; }
    public string? Bio { get; set; }
    public bool IsAvailable { get; set; }
}

public class CreateDoctorRequest
{
    // User info
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }

    // Doctor info
    public Guid DepartmentId { get; set; }
    public string Specialization { get; set; } = string.Empty;
    public string? Qualification { get; set; }
    public int ExperienceYears { get; set; }
    public string? LicenseNumber { get; set; }
    public decimal ConsultationFee { get; set; }
    public string? Bio { get; set; }
}
