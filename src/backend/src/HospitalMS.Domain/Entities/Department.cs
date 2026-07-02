using HospitalMS.Domain.Common;

namespace HospitalMS.Domain.Entities;

/// <summary>
/// Hospital department entity (e.g., Cardiology, Orthopedics, Neurology).
/// </summary>
public class Department : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconName { get; set; }
    public bool IsActive { get; set; } = true;

    // Head of department
    public Guid? HeadDoctorId { get; set; }
    public Doctor? HeadDoctor { get; set; }

    // Navigation
    public ICollection<Doctor> Doctors { get; set; } = [];
    public ICollection<Staff> Staff { get; set; } = [];
    public ICollection<Appointment> Appointments { get; set; } = [];
}
