namespace HospitalMS.Domain.Enums;

/// <summary>
/// Patient gender options.
/// </summary>
public enum Gender
{
    Male = 1,
    Female = 2,
    Other = 3
}

/// <summary>
/// Blood group classification.
/// </summary>
public enum BloodGroup
{
    APositive = 1,
    ANegative = 2,
    BPositive = 3,
    BNegative = 4,
    ABPositive = 5,
    ABNegative = 6,
    OPositive = 7,
    ONegative = 8
}

/// <summary>
/// Bed occupancy status in a ward.
/// </summary>
public enum BedStatus
{
    Available = 1,
    Occupied = 2,
    Maintenance = 3,
    Reserved = 4
}

/// <summary>
/// Admission lifecycle status.
/// </summary>
public enum AdmissionStatus
{
    Active = 1,
    DischargeReady = 2,
    Discharged = 3,
    Transferred = 4
}

/// <summary>
/// Invoice/billing payment status.
/// </summary>
public enum PaymentStatus
{
    Pending = 1,
    PartiallyPaid = 2,
    Paid = 3,
    Overdue = 4,
    Refunded = 5
}

/// <summary>
/// Payment method used.
/// </summary>
public enum PaymentMethod
{
    Cash = 1,
    Card = 2,
    BankTransfer = 3,
    Insurance = 4,
    Online = 5
}

/// <summary>
/// Token/queue status for reception.
/// </summary>
public enum TokenStatus
{
    Waiting = 1,
    Called = 2,
    InProgress = 3,
    Completed = 4,
    Skipped = 5
}

/// <summary>
/// Medicine administration status for ward tracking.
/// </summary>
public enum MedicineStatus
{
    Pending = 1,
    Administered = 2,
    Skipped = 3,
    Delayed = 4
}

/// <summary>
/// Document type classification for uploads.
/// </summary>
public enum DocumentType
{
    LabReport = 1,
    XRay = 2,
    MRI = 3,
    Prescription = 4,
    InsuranceCard = 5,
    IdProof = 6,
    Other = 7
}

/// <summary>
/// Staff type — determines which dashboard they see.
/// </summary>
public enum StaffType
{
    Receptionist = 1,
    WardStaff = 2,
    LabTechnician = 3,
    Nurse = 4
}

/// <summary>
/// Notification type for categorization.
/// </summary>
public enum NotificationType
{
    AppointmentReminder = 1,
    NewPatient = 2,
    ReportUploaded = 3,
    BillGenerated = 4,
    SystemAlert = 5,
    General = 6
}

/// <summary>
/// Day of the week for doctor schedules.
/// </summary>
public enum DayOfWeekEnum
{
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6,
    Sunday = 7
}
