using Asp.Versioning;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalMS.Application.Common;
using HospitalMS.Application.DTOs.Appointment;
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
public class AppointmentsController : ApiControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AppointmentsController(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AppointmentDto>>>> GetAll([FromQuery] Guid? doctorId, [FromQuery] Guid? patientId)
    {
        var query = _unitOfWork.Appointments.Query()
            .Include(a => a.Patient).ThenInclude(p => p.User)
            .Include(a => a.Doctor).ThenInclude(d => d.User)
            .Include(a => a.Department)
            .AsQueryable();

        if (doctorId.HasValue)
        {
            query = query.Where(a => a.DoctorId == doctorId.Value);
        }

        if (patientId.HasValue)
        {
            query = query.Where(a => a.PatientId == patientId.Value);
        }

        var appointments = await query.ToListAsync();
        var dtos = _mapper.Map<IReadOnlyList<AppointmentDto>>(appointments);
        return OkResponse(dtos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<AppointmentDto>>> GetById(Guid id)
    {
        var appointment = await _unitOfWork.Appointments.Query()
            .Include(a => a.Patient).ThenInclude(p => p.User)
            .Include(a => a.Doctor).ThenInclude(d => d.User)
            .Include(a => a.Department)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null)
            throw new NotFoundException($"Appointment with ID {id} not found.");

        var dto = _mapper.Map<AppointmentDto>(appointment);
        return OkResponse(dto);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<AppointmentDto>>> Create([FromBody] CreateAppointmentRequest request)
    {
        // 1. Verify Patient, Doctor, and Department exist
        var patientExists = await _unitOfWork.Patients.AnyAsync(p => p.Id == request.PatientId);
        if (!patientExists)
            throw new NotFoundException($"Patient with ID {request.PatientId} not found.");

        var doctorExists = await _unitOfWork.Doctors.AnyAsync(d => d.Id == request.DoctorId);
        if (!doctorExists)
            throw new NotFoundException($"Doctor with ID {request.DoctorId} not found.");

        var deptExists = await _unitOfWork.Departments.AnyAsync(d => d.Id == request.DepartmentId);
        if (!deptExists)
            throw new NotFoundException($"Department with ID {request.DepartmentId} not found.");

        // 2. Parse TimeSlot
        TimeSpan slot = TimeSpan.FromHours(9); // default 9 AM
        if (!string.IsNullOrEmpty(request.TimeSlot) && TimeSpan.TryParse(request.TimeSlot, out var parsedSlot))
        {
            slot = parsedSlot;
        }

        // 3. Calculate Token
        var date = request.AppointmentDate.Date;
        var tokenCount = await _unitOfWork.Appointments.CountAsync(a => 
            a.AppointmentDate.Date == date && 
            a.DoctorId == request.DoctorId);
        int tokenNumber = tokenCount + 1;

        // 4. Create entity
        var appointment = _mapper.Map<Appointment>(request);
        appointment.Id = Guid.NewGuid();
        appointment.AppointmentDate = date;
        appointment.TimeSlot = slot;
        appointment.TokenNumber = tokenNumber;
        appointment.Status = AppointmentStatus.Scheduled;

        await _unitOfWork.Appointments.AddAsync(appointment);

        // Add to Queue Tokens automatically for reception dashboard if it's today
        if (date == DateTime.UtcNow.Date)
        {
            await _unitOfWork.Tokens.AddAsync(new Token
            {
                Id = Guid.NewGuid(),
                AppointmentId = appointment.Id,
                TokenNumber = tokenNumber,
                Status = TokenStatus.Waiting,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            });
        }

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Scheduled Appointment (Token #{tokenNumber})",
            EntityName = "Appointment",
            EntityId = appointment.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        var created = await _unitOfWork.Appointments.Query()
            .Include(a => a.Patient).ThenInclude(p => p.User)
            .Include(a => a.Doctor).ThenInclude(d => d.User)
            .Include(a => a.Department)
            .FirstAsync(a => a.Id == appointment.Id);

        var dto = _mapper.Map<AppointmentDto>(created);
        return CreatedResponse(dto, "Appointment booked successfully.");
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<AppointmentDto>>> Update(Guid id, [FromBody] UpdateAppointmentRequest request)
    {
        var appointment = await _unitOfWork.Appointments.Query()
            .Include(a => a.Patient).ThenInclude(p => p.User)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null)
            throw new NotFoundException($"Appointment with ID {id} not found.");

        if (request.AppointmentDate.HasValue)
        {
            appointment.AppointmentDate = request.AppointmentDate.Value.Date;
        }

        if (!string.IsNullOrEmpty(request.TimeSlot) && TimeSpan.TryParse(request.TimeSlot, out var parsedSlot))
        {
            appointment.TimeSlot = parsedSlot;
        }

        if (request.Status.HasValue)
        {
            appointment.Status = request.Status.Value;
        }

        if (request.Notes != null)
        {
            appointment.Notes = request.Notes;
        }

        if (request.CancellationReason != null)
        {
            appointment.CancellationReason = request.CancellationReason;
        }

        _unitOfWork.Appointments.Update(appointment);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Updated Appointment status to: {appointment.Status}",
            EntityName = "Appointment",
            EntityId = appointment.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        var updated = await _unitOfWork.Appointments.Query()
            .Include(a => a.Patient).ThenInclude(p => p.User)
            .Include(a => a.Doctor).ThenInclude(d => d.User)
            .Include(a => a.Department)
            .FirstAsync(a => a.Id == appointment.Id);

        var dto = _mapper.Map<AppointmentDto>(updated);
        return OkResponse(dto, "Appointment updated successfully.");
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<ApiResponse<AppointmentDto>>> ChangeStatus(Guid id, [FromQuery] AppointmentStatus status, [FromBody] string? reason)
    {
        var appointment = await _unitOfWork.Appointments.Query()
            .Include(a => a.Patient).ThenInclude(p => p.User)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (appointment == null)
            throw new NotFoundException($"Appointment with ID {id} not found.");

        appointment.Status = status;
        if (status == AppointmentStatus.Cancelled)
        {
            appointment.CancellationReason = reason ?? "Cancelled by staff.";
        }

        _unitOfWork.Appointments.Update(appointment);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Changed Appointment Status: {status}",
            EntityName = "Appointment",
            EntityId = appointment.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        var updated = await _unitOfWork.Appointments.Query()
            .Include(a => a.Patient).ThenInclude(p => p.User)
            .Include(a => a.Doctor).ThenInclude(d => d.User)
            .Include(a => a.Department)
            .FirstAsync(a => a.Id == appointment.Id);

        var dto = _mapper.Map<AppointmentDto>(updated);
        return OkResponse(dto, $"Appointment marked as {status}.");
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> Delete(Guid id)
    {
        var appointment = await _unitOfWork.Appointments.GetByIdAsync(id);
        if (appointment == null)
            throw new NotFoundException($"Appointment with ID {id} not found.");

        _unitOfWork.Appointments.SoftDelete(appointment);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Deleted Appointment",
            EntityName = "Appointment",
            EntityId = appointment.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();
        return OkResponse("Appointment deleted successfully.");
    }
}
