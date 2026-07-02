namespace HospitalMS.Application.DTOs.Department;

public class DepartmentDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconName { get; set; }
    public bool IsActive { get; set; }
    public Guid? HeadDoctorId { get; set; }
    public string? HeadDoctorName { get; set; }
    public int DoctorCount { get; set; }
}

public class CreateDepartmentRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? IconName { get; set; }
    public Guid? HeadDoctorId { get; set; }
}

public class UpdateDepartmentRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? IconName { get; set; }
    public Guid? HeadDoctorId { get; set; }
    public bool? IsActive { get; set; }
}
