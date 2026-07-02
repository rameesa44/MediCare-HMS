using HospitalMS.Domain.Common;
using HospitalMS.Domain.Enums;

namespace HospitalMS.Domain.Entities;

/// <summary>
/// Staff entity for Receptionists, Ward Staff, and other non-doctor personnel.
/// One-to-one with User entity.
/// </summary>
public class Staff : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }

    public string Designation { get; set; } = string.Empty;
    public StaffType StaffType { get; set; }
    public string? EmployeeId { get; set; }
    public DateTime? JoiningDate { get; set; }

    // Ward staff specific
    public Guid? AssignedWardId { get; set; }
    public Ward? AssignedWard { get; set; }
}
