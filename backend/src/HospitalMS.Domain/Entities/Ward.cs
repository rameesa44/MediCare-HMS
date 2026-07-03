using HospitalMS.Domain.Common;
using HospitalMS.Domain.Enums;

namespace HospitalMS.Domain.Entities;

/// <summary>
/// Hospital ward containing beds for inpatient care.
/// </summary>
public class Ward : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Type { get; set; }
    public int TotalBeds { get; set; }
    public int FloorNumber { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Description { get; set; }

    // Computed
    public int AvailableBeds => Beds.Count(b => b.Status == BedStatus.Available);

    // Navigation
    public ICollection<Bed> Beds { get; set; } = [];
    public ICollection<Admission> Admissions { get; set; } = [];
    public ICollection<Staff> AssignedStaff { get; set; } = [];
}

/// <summary>
/// Individual bed within a ward.
/// </summary>
public class Bed : BaseEntity
{
    public Guid WardId { get; set; }
    public Ward Ward { get; set; } = null!;

    public string BedNumber { get; set; } = string.Empty;
    public BedStatus Status { get; set; } = BedStatus.Available;

    // Navigation
    public ICollection<Admission> Admissions { get; set; } = [];
}
