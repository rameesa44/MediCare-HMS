using HospitalMS.Domain.Common;
using HospitalMS.Domain.Enums;

namespace HospitalMS.Domain.Entities;

/// <summary>
/// Appointment entity representing a scheduled or walk-in visit.
/// Links patient, doctor, and department together.
/// </summary>
public class Appointment : BaseEntity
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;

    public Guid DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;

    public Guid DepartmentId { get; set; }
    public Department Department { get; set; } = null!;

    public DateTime AppointmentDate { get; set; }
    public TimeSpan TimeSlot { get; set; }
    public int TokenNumber { get; set; }

    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
    public AppointmentType Type { get; set; } = AppointmentType.Scheduled;

    public string? Symptoms { get; set; }
    public string? Notes { get; set; }
    public string? CancellationReason { get; set; }

    // Navigation
    public Token? Token { get; set; }
    public MedicalRecord? MedicalRecord { get; set; }
    public Invoice? Invoice { get; set; }
}
