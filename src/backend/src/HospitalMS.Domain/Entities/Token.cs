using HospitalMS.Domain.Common;
using HospitalMS.Domain.Enums;

namespace HospitalMS.Domain.Entities;

/// <summary>
/// Queue token generated at reception for patient tracking.
/// </summary>
public class Token : BaseEntity
{
    public Guid AppointmentId { get; set; }
    public Appointment Appointment { get; set; } = null!;

    public int TokenNumber { get; set; }
    public TokenStatus Status { get; set; } = TokenStatus.Waiting;
    public DateTime? CalledAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}
