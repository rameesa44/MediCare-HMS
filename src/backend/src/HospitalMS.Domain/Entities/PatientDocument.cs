using HospitalMS.Domain.Common;
using HospitalMS.Domain.Enums;

namespace HospitalMS.Domain.Entities;

/// <summary>
/// Document uploaded for a patient (lab reports, X-rays, ID proof, etc.).
/// </summary>
public class PatientDocument : BaseEntity
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;

    public DocumentType DocumentType { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string? ContentType { get; set; }
    public long FileSize { get; set; }
    public string? Description { get; set; }
    public string? UploadedBy { get; set; }
}
