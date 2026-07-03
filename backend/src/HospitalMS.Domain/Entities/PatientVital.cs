using HospitalMS.Domain.Common;
using HospitalMS.Domain.Enums;

namespace HospitalMS.Domain.Entities;

/// <summary>
/// Patient vital signs recorded by ward staff or nurse.
/// </summary>
public class PatientVital : BaseEntity
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;

    public Guid? AdmissionId { get; set; }
    public Admission? Admission { get; set; }

    public string? BloodPressure { get; set; }
    public decimal? Temperature { get; set; }
    public int? PulseRate { get; set; }
    public int? RespiratoryRate { get; set; }
    public decimal? OxygenSaturation { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    public string? Notes { get; set; }

    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;
    public string? RecordedBy { get; set; }
}
