using HospitalMS.Domain.Common;

namespace HospitalMS.Domain.Entities;

/// <summary>
/// Prescription issued by a doctor as part of a medical record.
/// </summary>
public class Prescription : BaseEntity
{
    public Guid MedicalRecordId { get; set; }
    public MedicalRecord MedicalRecord { get; set; } = null!;

    /// <summary>
    /// JSON array of medicines with dosage, frequency, duration.
    /// Example: [{"name":"Amoxicillin","dosage":"500mg","frequency":"3x daily","duration":"7 days"}]
    /// </summary>
    public string MedicinesJson { get; set; } = "[]";

    public string? Instructions { get; set; }
    public DateTime PrescriptionDate { get; set; } = DateTime.UtcNow;
}
