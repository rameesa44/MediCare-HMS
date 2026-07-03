using Asp.Versioning;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalMS.Application.Common;
using HospitalMS.Application.DTOs.AuditLog;
using HospitalMS.Domain.Interfaces;
using HospitalMS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HospitalMS.Api.Controllers;

[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/audit-logs")] // Matching frontend endpoint mapping
public class AuditLogsController : ApiControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AuditLogsController(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AuditLogDto>>>> GetLogs()
    {
        var logs = await _unitOfWork.AuditLogs.Query()
            .Include(l => l.User)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        var dtos = _mapper.Map<IReadOnlyList<AuditLogDto>>(logs);
        return OkResponse(dtos);
    }
}
