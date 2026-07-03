using Asp.Versioning;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalMS.Application.Common;
using HospitalMS.Application.DTOs.Patient;
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
public class PatientsController : ApiControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public PatientsController(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<PatientDto>>>> GetAll()
    {
        var patients = await _unitOfWork.Patients.Query()
            .Include(p => p.User)
            .ToListAsync();

        var dtos = _mapper.Map<IReadOnlyList<PatientDto>>(patients);
        return OkResponse(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<PatientDto>>> GetById(Guid id)
    {
        var patient = await _unitOfWork.Patients.Query()
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (patient == null)
            throw new NotFoundException($"Patient with ID {id} not found.");

        var dto = _mapper.Map<PatientDto>(patient);
        return OkResponse(dto);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<PatientDto>>> Create([FromBody] RegisterPatientRequest request)
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
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Patient123!"), // Default password for patient logins
            PhoneNumber = request.PhoneNumber,
            Role = UserRole.Patient,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "Admin"
        };
        await _unitOfWork.Users.AddAsync(user);

        // 2. Create Patient
        var patient = _mapper.Map<Patient>(request);
        patient.Id = Guid.NewGuid();
        patient.UserId = user.Id;
        patient.PatientNumber = "P-" + new Random().Next(10000, 99999).ToString();
        patient.CreatedAt = DateTime.UtcNow;
        patient.CreatedBy = "Admin";
        
        await _unitOfWork.Patients.AddAsync(patient);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Registered Patient: {user.FullName} ({patient.PatientNumber})",
            EntityName = "Patient",
            EntityId = patient.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        var createdPatient = await _unitOfWork.Patients.Query()
            .Include(p => p.User)
            .FirstAsync(p => p.Id == patient.Id);

        var dto = _mapper.Map<PatientDto>(createdPatient);
        return CreatedResponse(dto, "Patient registered successfully.");
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<PatientDto>>> Update(Guid id, [FromBody] RegisterPatientRequest request)
    {
        var patient = await _unitOfWork.Patients.Query()
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (patient == null)
            throw new NotFoundException($"Patient with ID {id} not found.");

        // Update User
        patient.User.FirstName = request.FirstName;
        patient.User.LastName = request.LastName;
        patient.User.PhoneNumber = request.PhoneNumber;

        // Update Patient details
        patient.DateOfBirth = request.DateOfBirth;
        patient.Gender = request.Gender;
        patient.BloodGroup = request.BloodGroup;
        patient.Address = request.Address;
        patient.City = request.City;
        patient.State = request.State;
        patient.ZipCode = request.ZipCode;
        patient.EmergencyContactName = request.EmergencyContactName;
        patient.EmergencyContactPhone = request.EmergencyContactPhone;
        patient.EmergencyContactRelation = request.EmergencyContactRelation;

        _unitOfWork.Patients.Update(patient);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Updated Patient: {patient.User.FullName}",
            EntityName = "Patient",
            EntityId = patient.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        var updatedPatient = await _unitOfWork.Patients.Query()
            .Include(p => p.User)
            .FirstAsync(p => p.Id == patient.Id);

        var dto = _mapper.Map<PatientDto>(updatedPatient);
        return OkResponse(dto, "Patient updated successfully.");
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id)
    {
        var patient = await _unitOfWork.Patients.Query()
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (patient == null)
            throw new NotFoundException($"Patient with ID {id} not found.");

        _unitOfWork.Patients.SoftDelete(patient);
        _unitOfWork.Users.SoftDelete(patient.User);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Deleted Patient: {patient.User.FullName}",
            EntityName = "Patient",
            EntityId = patient.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();
        return OkResponse("Patient deleted successfully.");
    }
}
