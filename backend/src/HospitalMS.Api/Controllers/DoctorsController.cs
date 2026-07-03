using Asp.Versioning;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalMS.Application.Common;
using HospitalMS.Application.DTOs.Doctor;
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
public class DoctorsController : ApiControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DoctorsController(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<DoctorDto>>>> GetAll()
    {
        var doctors = await _unitOfWork.Doctors.Query()
            .Include(d => d.User)
            .Include(d => d.Department)
            .ToListAsync();

        var dtos = _mapper.Map<IReadOnlyList<DoctorDto>>(doctors);
        return OkResponse(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<DoctorDto>>> GetById(Guid id)
    {
        var doctor = await _unitOfWork.Doctors.Query()
            .Include(d => d.User)
            .Include(d => d.Department)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (doctor == null)
            throw new NotFoundException($"Doctor with ID {id} not found.");

        var dto = _mapper.Map<DoctorDto>(doctor);
        return OkResponse(dto);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<DoctorDto>>> Create([FromBody] CreateDoctorRequest request)
    {
        var exists = await _unitOfWork.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (exists)
            throw new ConflictException("Email is already registered.");

        // 1. Create User
        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            PhoneNumber = request.PhoneNumber,
            Role = UserRole.Doctor,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "Admin"
        };
        await _unitOfWork.Users.AddAsync(user);

        // 2. Create Doctor
        var doctor = new Doctor
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            DepartmentId = request.DepartmentId,
            Specialization = request.Specialization,
            Qualification = request.Qualification,
            ExperienceYears = request.ExperienceYears,
            ConsultationFee = request.ConsultationFee,
            Bio = request.Bio,
            IsAvailable = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "Admin"
        };
        await _unitOfWork.Doctors.AddAsync(doctor);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Created Doctor: {user.FullName} ({doctor.Specialization})",
            EntityName = "Doctor",
            EntityId = doctor.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        // Query with includes to map correctly
        var createdDoctor = await _unitOfWork.Doctors.Query()
            .Include(d => d.User)
            .Include(d => d.Department)
            .FirstAsync(d => d.Id == doctor.Id);

        var dto = _mapper.Map<DoctorDto>(createdDoctor);
        return CreatedResponse(dto, "Doctor registered successfully.");
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<DoctorDto>>> Update(Guid id, [FromBody] CreateDoctorRequest request)
    {
        var doctor = await _unitOfWork.Doctors.Query()
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (doctor == null)
            throw new NotFoundException($"Doctor with ID {id} not found.");

        // Update User info
        doctor.User.FirstName = request.FirstName;
        doctor.User.LastName = request.LastName;
        doctor.User.PhoneNumber = request.PhoneNumber;

        // Update Doctor info
        doctor.DepartmentId = request.DepartmentId;
        doctor.Specialization = request.Specialization;
        doctor.Qualification = request.Qualification;
        doctor.ExperienceYears = request.ExperienceYears;
        doctor.ConsultationFee = request.ConsultationFee;
        doctor.Bio = request.Bio;

        _unitOfWork.Doctors.Update(doctor);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Updated Doctor: {doctor.User.FullName}",
            EntityName = "Doctor",
            EntityId = doctor.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        var updatedDoctor = await _unitOfWork.Doctors.Query()
            .Include(d => d.User)
            .Include(d => d.Department)
            .FirstAsync(d => d.Id == doctor.Id);

        var dto = _mapper.Map<DoctorDto>(updatedDoctor);
        return OkResponse(dto, "Doctor updated successfully.");
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id)
    {
        var doctor = await _unitOfWork.Doctors.Query()
            .Include(d => d.User)
            .FirstOrDefaultAsync(d => d.Id == id);

        if (doctor == null)
            throw new NotFoundException($"Doctor with ID {id} not found.");

        _unitOfWork.Doctors.SoftDelete(doctor);
        _unitOfWork.Users.SoftDelete(doctor.User);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Deleted Doctor: {doctor.User.FullName}",
            EntityName = "Doctor",
            EntityId = doctor.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();
        return OkResponse("Doctor deleted successfully.");
    }
}
