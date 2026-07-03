using Asp.Versioning;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalMS.Application.Common;
using HospitalMS.Application.DTOs.Ward;
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
public class WardsController : ApiControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public WardsController(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<WardDto>>>> GetAll()
    {
        var wards = await _unitOfWork.Wards.Query()
            .Include(w => w.Beds)
            .ToListAsync();

        var dtos = _mapper.Map<IReadOnlyList<WardDto>>(wards);
        return OkResponse(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<WardDto>>> GetById(Guid id)
    {
        var ward = await _unitOfWork.Wards.Query()
            .Include(w => w.Beds)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (ward == null)
            throw new NotFoundException($"Ward with ID {id} not found.");

        var dto = _mapper.Map<WardDto>(ward);
        return OkResponse(dto);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<WardDto>>> Create([FromBody] CreateWardRequest request)
    {
        var exists = await _unitOfWork.Wards.AnyAsync(w => w.Name.ToLower() == request.Name.ToLower());
        if (exists)
            throw new ConflictException($"Ward with name '{request.Name}' already exists.");

        var ward = _mapper.Map<Ward>(request);
        ward.Id = Guid.NewGuid();
        ward.IsActive = true;

        await _unitOfWork.Wards.AddAsync(ward);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Created Ward: {ward.Name}",
            EntityName = "Ward",
            EntityId = ward.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<WardDto>(ward);
        return CreatedResponse(dto, "Ward created successfully.");
    }

    [HttpPost("{wardId}/beds")]
    public async Task<ActionResult<ApiResponse<BedDto>>> AddBed(Guid wardId, [FromBody] CreateBedRequest request)
    {
        var ward = await _unitOfWork.Wards.GetByIdAsync(wardId);
        if (ward == null)
            throw new NotFoundException($"Ward with ID {wardId} not found.");

        var bedExists = await _unitOfWork.Beds.AnyAsync(b => b.WardId == wardId && b.BedNumber.ToLower() == request.BedNumber.ToLower());
        if (bedExists)
            throw new ConflictException($"Bed '{request.BedNumber}' already exists in this ward.");

        var bed = new Bed
        {
            Id = Guid.NewGuid(),
            WardId = wardId,
            BedNumber = request.BedNumber,
            Status = BedStatus.Available,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "Admin"
        };
        await _unitOfWork.Beds.AddAsync(bed);

        ward.TotalBeds += 1;
        _unitOfWork.Wards.Update(ward);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Added Bed {bed.BedNumber} to Ward: {ward.Name}",
            EntityName = "Bed",
            EntityId = bed.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        var createdBed = await _unitOfWork.Beds.Query()
            .Include(b => b.Ward)
            .FirstAsync(b => b.Id == bed.Id);

        var dto = _mapper.Map<BedDto>(createdBed);
        return CreatedResponse(dto, "Bed added successfully.");
    }

    [HttpPut("beds/{bedId}/status")]
    public async Task<ActionResult<ApiResponse<BedDto>>> ChangeBedStatus(Guid bedId, [FromQuery] BedStatus status)
    {
        var bed = await _unitOfWork.Beds.Query()
            .Include(b => b.Ward)
            .FirstOrDefaultAsync(b => b.Id == bedId);

        if (bed == null)
            throw new NotFoundException($"Bed with ID {bedId} not found.");

        bed.Status = status;
        _unitOfWork.Beds.Update(bed);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Updated Bed {bed.BedNumber} Status to: {status}",
            EntityName = "Bed",
            EntityId = bed.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<BedDto>(bed);
        return OkResponse(dto, $"Bed status updated to {status}.");
    }

    [HttpGet("admissions")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AdmissionDto>>>> GetAdmissions()
    {
        var admissions = await _unitOfWork.Admissions.Query()
            .Include(a => a.Patient).ThenInclude(p => p.User)
            .Include(a => a.Ward)
            .Include(a => a.Bed)
            .ToListAsync();

        var dtos = _mapper.Map<IReadOnlyList<AdmissionDto>>(admissions);
        return OkResponse(dtos);
    }

    [HttpPost("admissions")]
    public async Task<ActionResult<ApiResponse<AdmissionDto>>> AdmitPatient([FromBody] AdmitPatientRequest request)
    {
        var patientExists = await _unitOfWork.Patients.AnyAsync(p => p.Id == request.PatientId);
        if (!patientExists)
            throw new NotFoundException($"Patient with ID {request.PatientId} not found.");

        var wardExists = await _unitOfWork.Wards.AnyAsync(w => w.Id == request.WardId);
        if (!wardExists)
            throw new NotFoundException($"Ward with ID {request.WardId} not found.");

        var bed = await _unitOfWork.Beds.GetByIdAsync(request.BedId);
        if (bed == null)
            throw new NotFoundException($"Bed with ID {request.BedId} not found.");

        if (bed.Status != BedStatus.Available)
            throw new BadRequestException("Selected bed is not available.");

        // Find doctor to assign
        var doctor = await _unitOfWork.Doctors.FirstOrDefaultAsync(d => d.IsAvailable);
        if (doctor == null)
            throw new BadRequestException("No available doctor to assign to the admission.");

        // Create Admission
        var admission = new Admission
        {
            Id = Guid.NewGuid(),
            PatientId = request.PatientId,
            DoctorId = doctor.Id,
            WardId = request.WardId,
            BedId = request.BedId,
            AdmissionDate = DateTime.UtcNow,
            Status = AdmissionStatus.Active,
            Reason = request.ReasonForAdmission ?? "Routine Admission",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "Admin"
        };
        await _unitOfWork.Admissions.AddAsync(admission);

        // Update Bed status
        bed.Status = BedStatus.Occupied;
        _unitOfWork.Beds.Update(bed);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Admitted Patient to Bed: {bed.BedNumber}",
            EntityName = "Admission",
            EntityId = admission.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        var created = await _unitOfWork.Admissions.Query()
            .Include(a => a.Patient).ThenInclude(p => p.User)
            .Include(a => a.Ward)
            .Include(a => a.Bed)
            .FirstAsync(a => a.Id == admission.Id);

        var dto = _mapper.Map<AdmissionDto>(created);
        return CreatedResponse(dto, "Patient admitted successfully.");
    }

    [HttpPut("admissions/{admissionId}/discharge")]
    public async Task<ActionResult<ApiResponse<AdmissionDto>>> DischargePatient(Guid admissionId, [FromBody] DischargePatientRequest request)
    {
        var admission = await _unitOfWork.Admissions.Query()
            .Include(a => a.Patient).ThenInclude(p => p.User)
            .Include(a => a.Ward)
            .Include(a => a.Bed)
            .FirstOrDefaultAsync(a => a.Id == admissionId);

        if (admission == null)
            throw new NotFoundException($"Admission with ID {admissionId} not found.");

        if (admission.Status == AdmissionStatus.Discharged)
            throw new BadRequestException("Patient is already discharged.");

        admission.Status = AdmissionStatus.Discharged;
        admission.DischargeDate = DateTime.UtcNow;
        admission.DischargeNotes = request.DischargeSummary ?? "Discharged from hospital care.";

        // Free up Bed
        var bed = await _unitOfWork.Beds.GetByIdAsync(admission.BedId);
        if (bed != null)
        {
            bed.Status = BedStatus.Available;
            _unitOfWork.Beds.Update(bed);
        }

        _unitOfWork.Admissions.Update(admission);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Discharged Patient: {admission.Patient.User.FullName}",
            EntityName = "Admission",
            EntityId = admission.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        var dto = _mapper.Map<AdmissionDto>(admission);
        return OkResponse(dto, "Patient discharged successfully.");
    }
}
