using HospitalMS.Domain.Common;

namespace HospitalMS.Domain.Entities;

/// <summary>
/// Doctor entity with medical qualifications and availability settings.
/// One-to-one with User entity.
/// </summary>
public class Doctor : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid DepartmentId { get; set; }
    public Department Department { get; set; } = null!;

    public string Specialization { get; set; } = string.Empty;
    public string? Qualification { get; set; }
    public int ExperienceYears { get; set; }
    public string? LicenseNumber { get; set; }
    public decimal ConsultationFee { get; set; }
    public string? Bio { get; set; }
    public bool IsAvailable { get; set; } = true;

    // Navigation
    public ICollection<Appointment> Appointments { get; set; } = [];
    public ICollection<DoctorSchedule> Schedules { get; set; } = [];
    public ICollection<MedicalRecord> MedicalRecords { get; set; } = [];
    public ICollection<Admission> Admissions { get; set; } = [];
}
