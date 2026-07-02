using HospitalMS.Domain.Common;

namespace HospitalMS.Domain.Entities;

/// <summary>
/// Medical record created by a doctor during an appointment.
/// Contains diagnosis, treatment plan, and follow-up instructions.
/// </summary>
public class MedicalRecord : BaseEntity
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;

    public Guid DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;

    public Guid? AppointmentId { get; set; }
    public Appointment? Appointment { get; set; }

    public string Diagnosis { get; set; } = string.Empty;
    public string? TreatmentPlan { get; set; }
    public string? Notes { get; set; }
    public DateTime? FollowUpDate { get; set; }

    // Navigation
    public ICollection<Prescription> Prescriptions { get; set; } = [];
}
