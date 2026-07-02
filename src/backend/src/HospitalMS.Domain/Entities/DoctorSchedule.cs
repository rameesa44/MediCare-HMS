using HospitalMS.Domain.Common;
using HospitalMS.Domain.Enums;

namespace HospitalMS.Domain.Entities;

/// <summary>
/// Doctor's weekly schedule defining availability time slots.
/// </summary>
public class DoctorSchedule : BaseEntity
{
    public Guid DoctorId { get; set; }
    public Doctor Doctor { get; set; } = null!;

    public DayOfWeekEnum DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public int MaxPatients { get; set; } = 20;
    public int SlotDurationMinutes { get; set; } = 15;
    public bool IsActive { get; set; } = true;
}
