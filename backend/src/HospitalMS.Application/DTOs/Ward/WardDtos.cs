using System;
using System.Collections.Generic;
using HospitalMS.Domain.Enums;

namespace HospitalMS.Application.DTOs.Ward;

public class WardDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Type { get; set; }
    public int TotalBeds { get; set; }
    public int FloorNumber { get; set; }
    public bool IsActive { get; set; }
    public string? Description { get; set; }
    public int AvailableBeds { get; set; }
    public List<BedDto> Beds { get; set; } = [];
}

public class BedDto
{
    public Guid Id { get; set; }
    public Guid WardId { get; set; }
    public string WardName { get; set; } = string.Empty;
    public string BedNumber { get; set; } = string.Empty;
    public BedStatus Status { get; set; }
}

public class CreateWardRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Type { get; set; }
    public int FloorNumber { get; set; }
    public string? Description { get; set; }
}

public class CreateBedRequest
{
    public string BedNumber { get; set; } = string.Empty;
}

public class AdmissionDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientNumber { get; set; } = string.Empty;
    public Guid WardId { get; set; }
    public string WardName { get; set; } = string.Empty;
    public Guid BedId { get; set; }
    public string BedNumber { get; set; } = string.Empty;
    public DateTime AdmittedAt { get; set; }
    public DateTime? DischargedAt { get; set; }
    public AdmissionStatus Status { get; set; }
    public string? ReasonForAdmission { get; set; }
    public string? DischargeSummary { get; set; }
}

public class AdmitPatientRequest
{
    public Guid PatientId { get; set; }
    public Guid WardId { get; set; }
    public Guid BedId { get; set; }
    public string? ReasonForAdmission { get; set; }
}

public class DischargePatientRequest
{
    public string? DischargeSummary { get; set; }
}
