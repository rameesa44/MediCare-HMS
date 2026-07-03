using Asp.Versioning;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using HospitalMS.Application.Common;
using HospitalMS.Application.DTOs.Setting;
using HospitalMS.Domain.Interfaces;
using HospitalMS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HospitalMS.Api.Controllers;

[ApiVersion("1.0")]
public class SettingsController : ApiControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public SettingsController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<UpdateHospitalSettingsRequest>>> GetSettings()
    {
        var settingsList = await _unitOfWork.HospitalSettings.GetAllAsync();
        
        var dto = new UpdateHospitalSettingsRequest();
        
        var nameSetting = settingsList.FirstOrDefault(s => s.Key == "HospitalName");
        if (nameSetting != null) dto.HospitalName = nameSetting.Value;

        var emailSetting = settingsList.FirstOrDefault(s => s.Key == "ContactEmail");
        if (emailSetting != null) dto.ContactEmail = emailSetting.Value;

        var phoneSetting = settingsList.FirstOrDefault(s => s.Key == "ContactPhone");
        if (phoneSetting != null) dto.ContactPhone = phoneSetting.Value;

        var addrSetting = settingsList.FirstOrDefault(s => s.Key == "Address");
        if (addrSetting != null) dto.Address = addrSetting.Value;

        var currencySetting = settingsList.FirstOrDefault(s => s.Key == "CurrencySymbol");
        if (currencySetting != null) dto.CurrencySymbol = currencySetting.Value;

        var feeSetting = settingsList.FirstOrDefault(s => s.Key == "DefaultConsultationFee");
        if (feeSetting != null) dto.DefaultConsultationFee = feeSetting.Value;

        return OkResponse(dto);
    }

    [HttpPut]
    public async Task<ActionResult<ApiResponse<UpdateHospitalSettingsRequest>>> UpdateSettings([FromBody] UpdateHospitalSettingsRequest request)
    {
        var settingsList = await _unitOfWork.HospitalSettings.GetAllAsync();

        async Task UpsertSetting(string key, string value, string category, string description)
        {
            var existing = settingsList.FirstOrDefault(s => s.Key == key);
            if (existing != null)
            {
                existing.Value = value;
                _unitOfWork.HospitalSettings.Update(existing);
            }
            else
            {
                await _unitOfWork.HospitalSettings.AddAsync(new HospitalSetting
                {
                    Id = Guid.NewGuid(),
                    Key = key,
                    Value = value,
                    Category = category,
                    Description = description,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "Admin"
                });
            }
        }

        await UpsertSetting("HospitalName", request.HospitalName, "General", "Name of the hospital");
        await UpsertSetting("ContactEmail", request.ContactEmail, "Contact", "Contact email address");
        await UpsertSetting("ContactPhone", request.ContactPhone, "Contact", "Contact phone number");
        await UpsertSetting("Address", request.Address, "Contact", "Physical address of the hospital");
        await UpsertSetting("CurrencySymbol", request.CurrencySymbol, "Billing", "System currency symbol");
        await UpsertSetting("DefaultConsultationFee", request.DefaultConsultationFee, "Billing", "Default fee for doctors");

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = "Updated Hospital Settings",
            EntityName = "HospitalSetting",
            EntityId = "ALL"
        });

        await _unitOfWork.SaveChangesAsync();

        return OkResponse(request, "Settings updated successfully.");
    }
}
