using Asp.Versioning;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalMS.Application.Common;
using HospitalMS.Application.DTOs.Staff;
using HospitalMS.Domain.Interfaces;
using HospitalMS.Domain.Entities;
using HospitalMS.Domain.Enums;
using HospitalMS.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HospitalMS.Api.Controllers;

[ApiVersion("1.0")]
public class StaffController : ApiControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public StaffController(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<StaffDto>>>> GetAll()
    {
        var staff = await _unitOfWork.StaffMembers.Query()
            .Include(s => s.User)
            .Include(s => s.Department)
            .Include(s => s.AssignedWard)
            .ToListAsync();

        var dtos = _mapper.Map<IReadOnlyList<StaffDto>>(staff);
        return OkResponse(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<StaffDto>>> GetById(Guid id)
    {
        var member = await _unitOfWork.StaffMembers.Query()
            .Include(s => s.User)
            .Include(s => s.Department)
            .Include(s => s.AssignedWard)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (member == null)
            throw new NotFoundException($"Staff with ID {id} not found.");

        var dto = _mapper.Map<StaffDto>(member);
        return OkResponse(dto);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<StaffDto>>> Create([FromBody] CreateStaffRequest request)
    {
        var exists = await _unitOfWork.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (exists)
            throw new ConflictException("Email is already registered.");

        // Determine user role
        UserRole userRole = request.StaffType switch
        {
            StaffType.Receptionist => UserRole.Receptionist,
            StaffType.WardStaff => UserRole.WardStaff,
            StaffType.Nurse => UserRole.WardStaff,
            _ => UserRole.WardStaff
        };

        // 1. Create User
        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            PhoneNumber = request.PhoneNumber,
            Role = userRole,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "Admin"
        };
        await _unitOfWork.Users.AddAsync(user);

        // 2. Create Staff
        var staff = new Staff
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            DepartmentId = request.DepartmentId,
            Designation = request.Designation,
            StaffType = request.StaffType,
            EmployeeId = request.EmployeeId ?? "EMP-" + new Random().Next(1000, 9999),
            JoiningDate = DateTime.UtcNow,
            AssignedWardId = request.AssignedWardId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "Admin"
        };
        await _unitOfWork.StaffMembers.AddAsync(staff);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Created Staff: {user.FullName} ({staff.Designation})",
            EntityName = "Staff",
            EntityId = staff.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        var createdStaff = await _unitOfWork.StaffMembers.Query()
            .Include(s => s.User)
            .Include(s => s.Department)
            .Include(s => s.AssignedWard)
            .FirstAsync(s => s.Id == staff.Id);

        var dto = _mapper.Map<StaffDto>(createdStaff);
        return CreatedResponse(dto, "Staff member created successfully.");
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<StaffDto>>> Update(Guid id, [FromBody] UpdateStaffRequest request)
    {
        var staff = await _unitOfWork.StaffMembers.Query()
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (staff == null)
            throw new NotFoundException($"Staff with ID {id} not found.");

        if (request.Designation != null) staff.Designation = request.Designation;
        if (request.StaffType.HasValue)
        {
            staff.StaffType = request.StaffType.Value;
            staff.User.Role = request.StaffType.Value switch
            {
                StaffType.Receptionist => UserRole.Receptionist,
                StaffType.WardStaff => UserRole.WardStaff,
                StaffType.Nurse => UserRole.WardStaff,
                _ => UserRole.WardStaff
            };
        }
        staff.DepartmentId = request.DepartmentId;
        staff.AssignedWardId = request.AssignedWardId;

        _unitOfWork.StaffMembers.Update(staff);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Updated Staff: {staff.User.FullName}",
            EntityName = "Staff",
            EntityId = staff.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        var updatedStaff = await _unitOfWork.StaffMembers.Query()
            .Include(s => s.User)
            .Include(s => s.Department)
            .Include(s => s.AssignedWard)
            .FirstAsync(s => s.Id == staff.Id);

        var dto = _mapper.Map<StaffDto>(updatedStaff);
        return OkResponse(dto, "Staff member updated successfully.");
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id)
    {
        var staff = await _unitOfWork.StaffMembers.Query()
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (staff == null)
            throw new NotFoundException($"Staff with ID {id} not found.");

        _unitOfWork.StaffMembers.SoftDelete(staff);
        _unitOfWork.Users.SoftDelete(staff.User);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Deleted Staff: {staff.User.FullName}",
            EntityName = "Staff",
            EntityId = staff.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();
        return OkResponse("Staff member deleted successfully.");
    }
}
