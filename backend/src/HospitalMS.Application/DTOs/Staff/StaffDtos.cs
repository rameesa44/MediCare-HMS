using System;
using HospitalMS.Domain.Enums;

namespace HospitalMS.Application.DTOs.Staff;

public class StaffDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string StaffName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public Guid? DepartmentId { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public StaffType StaffType { get; set; }
    public string? EmployeeId { get; set; }
    public DateTime? JoiningDate { get; set; }
    public Guid? AssignedWardId { get; set; }
    public string AssignedWardName { get; set; } = string.Empty;
}

public class CreateStaffRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public Guid? DepartmentId { get; set; }
    public string Designation { get; set; } = string.Empty;
    public StaffType StaffType { get; set; }
    public string? EmployeeId { get; set; }
    public Guid? AssignedWardId { get; set; }
}

public class UpdateStaffRequest
{
    public string? Designation { get; set; }
    public StaffType? StaffType { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? AssignedWardId { get; set; }
}
