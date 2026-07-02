namespace HospitalMS.Domain.Enums;

/// <summary>
/// System-wide user roles determining access level and dashboard type.
/// </summary>
public enum UserRole
{
    Admin = 1,
    Doctor = 2,
    Receptionist = 3,
    WardStaff = 4,
    Patient = 5
}
