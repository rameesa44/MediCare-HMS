using HospitalMS.Domain.Common;
using HospitalMS.Domain.Enums;

namespace HospitalMS.Domain.Entities;

/// <summary>
/// Patient admission record for inpatient care.
/// </summary>
public class Admission : BaseEntity
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;

    public Guid DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;

    public Guid WardId { get; set; }
    public Ward Ward { get; set; } = null!;

    public Guid BedId { get; set; }
    public Bed Bed { get; set; } = null!;

    public DateTime AdmissionDate { get; set; } = DateTime.UtcNow;
    public DateTime? DischargeDate { get; set; }
    public AdmissionStatus Status { get; set; } = AdmissionStatus.Active;
    public string Reason { get; set; } = string.Empty;
    public string? DischargeNotes { get; set; }

    // Navigation
    public ICollection<DailyNote> DailyNotes { get; set; } = [];
    public ICollection<MedicineAdministration> MedicineAdministrations { get; set; } = [];
    public ICollection<PatientVital> Vitals { get; set; } = [];
}

/// <summary>
/// Daily notes added by ward staff for an admitted patient.
/// </summary>
public class DailyNote : BaseEntity
{
    public Guid AdmissionId { get; set; }
    public Admission Admission { get; set; } = null!;

    public string Notes { get; set; } = string.Empty;
    public DateTime NoteDate { get; set; } = DateTime.UtcNow;
    public string? StaffName { get; set; }
}

/// <summary>
/// Tracks medicine administration for admitted patients.
/// </summary>
public class MedicineAdministration : BaseEntity
{
    public Guid AdmissionId { get; set; }
    public Admission Admission { get; set; } = null!;

    public string MedicineName { get; set; } = string.Empty;
    public string? Dosage { get; set; }
    public MedicineStatus Status { get; set; } = MedicineStatus.Pending;
    public DateTime ScheduledTime { get; set; }
    public DateTime? AdministeredAt { get; set; }
    public string? AdministeredBy { get; set; }
    public string? Notes { get; set; }
}
