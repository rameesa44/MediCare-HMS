namespace HospitalMS.Domain.Enums;

/// <summary>
/// Tracks the lifecycle of an appointment from creation to completion.
/// </summary>
public enum AppointmentStatus
{
    Scheduled = 1,
    CheckedIn = 2,
    InProgress = 3,
    Completed = 4,
    Cancelled = 5,
    NoShow = 6
}

/// <summary>
/// Type of appointment — walk-in vs pre-scheduled.
/// </summary>
public enum AppointmentType
{
    Scheduled = 1,
    WalkIn = 2,
    Emergency = 3,
    FollowUp = 4
}
