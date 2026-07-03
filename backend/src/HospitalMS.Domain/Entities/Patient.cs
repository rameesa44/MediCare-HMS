using HospitalMS.Domain.Common;
using HospitalMS.Domain.Enums;

namespace HospitalMS.Domain.Entities;

/// <summary>
/// Patient entity with personal and medical information.
/// One-to-one with User entity.
/// </summary>
public class Patient : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    /// <summary>
    /// Auto-generated patient number (e.g., PAT-2026-0001).
    /// </summary>
    public string PatientNumber { get; set; } = string.Empty;

    public DateTime DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public BloodGroup? BloodGroup { get; set; }

    // Address
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? ZipCode { get; set; }

    // Emergency
    public string? EmergencyContactName { get; set; }
    public string? EmergencyContactPhone { get; set; }
    public string? EmergencyContactRelation { get; set; }

    // Insurance
    public string? InsuranceProvider { get; set; }
    public string? InsuranceNumber { get; set; }

    // Medical
    public string? Allergies { get; set; }
    public string? ChronicConditions { get; set; }

    // Navigation
    public ICollection<Appointment> Appointments { get; set; } = [];
    public ICollection<MedicalRecord> MedicalRecords { get; set; } = [];
    public ICollection<PatientDocument> Documents { get; set; } = [];
    public ICollection<Admission> Admissions { get; set; } = [];
    public ICollection<Invoice> Invoices { get; set; } = [];
    public ICollection<PatientVital> Vitals { get; set; } = [];
}
