using Asp.Versioning;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using HospitalMS.Application.Common;
using HospitalMS.Application.DTOs.Department;
using HospitalMS.Domain.Interfaces;
using HospitalMS.Domain.Entities;
using HospitalMS.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HospitalMS.Api.Controllers;

[ApiVersion("1.0")]
public class DepartmentsController : ApiControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DepartmentsController(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<DepartmentDto>>>> GetAll()
    {
        var departments = await _unitOfWork.Departments.GetAllAsync();
        var dtos = _mapper.Map<IReadOnlyList<DepartmentDto>>(departments);
        
        // Populate additional counts and details
        foreach (var dto in dtos)
        {
            dto.DoctorCount = await _unitOfWork.Doctors.CountAsync(d => d.DepartmentId == dto.Id);
            if (dto.HeadDoctorId.HasValue)
            {
                var headDoc = await _unitOfWork.Doctors.GetByIdAsync(dto.HeadDoctorId.Value);
                if (headDoc != null)
                {
                    var user = await _unitOfWork.Users.GetByIdAsync(headDoc.UserId);
                    dto.HeadDoctorName = user?.FullName;
                }
            }
        }

        return OkResponse(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> GetById(Guid id)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(id);
        if (department == null)
            throw new NotFoundException($"Department with ID {id} not found.");

        var dto = _mapper.Map<DepartmentDto>(department);
        dto.DoctorCount = await _unitOfWork.Doctors.CountAsync(d => d.DepartmentId == dto.Id);
        if (dto.HeadDoctorId.HasValue)
        {
            var headDoc = await _unitOfWork.Doctors.GetByIdAsync(dto.HeadDoctorId.Value);
            if (headDoc != null)
            {
                var user = await _unitOfWork.Users.GetByIdAsync(headDoc.UserId);
                dto.HeadDoctorName = user?.FullName;
            }
        }

        return OkResponse(dto);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> Create([FromBody] CreateDepartmentRequest request)
    {
        var exists = await _unitOfWork.Departments.AnyAsync(d => d.Name.ToLower() == request.Name.ToLower());
        if (exists)
            throw new ConflictException($"Department with name '{request.Name}' already exists.");

        var department = _mapper.Map<Department>(request);
        department.Id = Guid.NewGuid();
        department.IsActive = true;

        await _unitOfWork.Departments.AddAsync(department);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Created Department: {department.Name}",
            EntityName = "Department",
            EntityId = department.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<DepartmentDto>(department);
        return CreatedResponse(dto, "Department created successfully.");
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> Update(Guid id, [FromBody] UpdateDepartmentRequest request)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(id);
        if (department == null)
            throw new NotFoundException($"Department with ID {id} not found.");

        _mapper.Map(request, department);
        _unitOfWork.Departments.Update(department);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Updated Department: {department.Name}",
            EntityName = "Department",
            EntityId = department.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<DepartmentDto>(department);
        return OkResponse(dto, "Department updated successfully.");
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(id);
        if (department == null)
            throw new NotFoundException($"Department with ID {id} not found.");

        _unitOfWork.Departments.SoftDelete(department);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Soft Deleted Department: {department.Name}",
            EntityName = "Department",
            EntityId = department.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        return OkResponse("Department deleted successfully.");
    }
}
