using System;
using HospitalMS.Domain.Enums;

namespace HospitalMS.Application.DTOs.Appointment;

public class AppointmentDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientNumber { get; set; } = string.Empty;
    public Guid DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public DateTime AppointmentDate { get; set; }
    public TimeSpan TimeSlot { get; set; }
    public int TokenNumber { get; set; }
    public AppointmentStatus Status { get; set; }
    public AppointmentType Type { get; set; }
    public string? Symptoms { get; set; }
    public string? Notes { get; set; }
    public string? CancellationReason { get; set; }
}

public class CreateAppointmentRequest
{
    public Guid PatientId { get; set; }
    public Guid DoctorId { get; set; }
    public Guid DepartmentId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public string? TimeSlot { get; set; } // e.g. "09:00:00" or TimeSpan format
    public AppointmentType Type { get; set; } = AppointmentType.Scheduled;
    public string? Symptoms { get; set; }
    public string? Notes { get; set; }
}

public class UpdateAppointmentRequest
{
    public DateTime? AppointmentDate { get; set; }
    public string? TimeSlot { get; set; }
    public AppointmentStatus? Status { get; set; }
    public string? Notes { get; set; }
    public string? CancellationReason { get; set; }
}
