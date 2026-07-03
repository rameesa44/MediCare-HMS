using AutoMapper;
using HospitalMS.Domain.Entities;
using HospitalMS.Application.DTOs.Auth;
using HospitalMS.Application.DTOs.Department;
using HospitalMS.Application.DTOs.Doctor;
using HospitalMS.Application.DTOs.Patient;
using HospitalMS.Application.DTOs.Staff;
using HospitalMS.Application.DTOs.Appointment;
using HospitalMS.Application.DTOs.Ward;
using HospitalMS.Application.DTOs.Billing;
using HospitalMS.Application.DTOs.AuditLog;
using HospitalMS.Application.DTOs.Setting;

namespace HospitalMS.Application.Mappings;

/// <summary>
/// AutoMapper profile defining all entity-to-DTO mappings.
/// </summary>
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>()
            .ForMember(d => d.FullName, o => o.MapFrom(s => s.FullName));
        CreateMap<RegisterRequest, User>();

        // Department mappings
        CreateMap<Department, DepartmentDto>();
        CreateMap<CreateDepartmentRequest, Department>();
        CreateMap<UpdateDepartmentRequest, Department>()
            .ForAllMembers(o => o.Condition((src, dest, srcMember) => srcMember != null));

        // Doctor mappings
        CreateMap<Doctor, DoctorDto>()
            .ForMember(d => d.DoctorName, o => o.MapFrom(s => s.User.FullName))
            .ForMember(d => d.Email, o => o.MapFrom(s => s.User.Email))
            .ForMember(d => d.Phone, o => o.MapFrom(s => s.User.PhoneNumber))
            .ForMember(d => d.ProfileImage, o => o.MapFrom(s => s.User.ProfileImageUrl))
            .ForMember(d => d.DepartmentName, o => o.MapFrom(s => s.Department.Name));

        // Patient mappings
        CreateMap<Patient, PatientDto>()
            .ForMember(d => d.PatientName, o => o.MapFrom(s => s.User.FullName))
            .ForMember(d => d.Email, o => o.MapFrom(s => s.User.Email))
            .ForMember(d => d.Phone, o => o.MapFrom(s => s.User.PhoneNumber));
        CreateMap<RegisterPatientRequest, Patient>();

        // Staff mappings
        CreateMap<Staff, StaffDto>()
            .ForMember(d => d.StaffName, o => o.MapFrom(s => s.User.FullName))
            .ForMember(d => d.Email, o => o.MapFrom(s => s.User.Email))
            .ForMember(d => d.Phone, o => o.MapFrom(s => s.User.PhoneNumber))
            .ForMember(d => d.DepartmentName, o => o.MapFrom(s => s.Department != null ? s.Department.Name : string.Empty))
            .ForMember(d => d.AssignedWardName, o => o.MapFrom(s => s.AssignedWard != null ? s.AssignedWard.Name : string.Empty));
        CreateMap<CreateStaffRequest, Staff>();
        CreateMap<UpdateStaffRequest, Staff>()
            .ForAllMembers(o => o.Condition((src, dest, srcMember) => srcMember != null));

        // Appointment mappings
        CreateMap<Appointment, AppointmentDto>()
            .ForMember(d => d.PatientName, o => o.MapFrom(s => s.Patient.User.FullName))
            .ForMember(d => d.PatientNumber, o => o.MapFrom(s => s.Patient.PatientNumber))
            .ForMember(d => d.DoctorName, o => o.MapFrom(s => s.Doctor.User.FullName))
            .ForMember(d => d.DepartmentName, o => o.MapFrom(s => s.Department.Name));
        CreateMap<CreateAppointmentRequest, Appointment>();
        CreateMap<UpdateAppointmentRequest, Appointment>()
            .ForAllMembers(o => o.Condition((src, dest, srcMember) => srcMember != null));

        // Ward mappings
        CreateMap<Ward, WardDto>()
            .ForMember(d => d.AvailableBeds, o => o.MapFrom(s => s.AvailableBeds));
        CreateMap<Bed, BedDto>()
            .ForMember(d => d.WardName, o => o.MapFrom(s => s.Ward.Name));
        CreateMap<CreateWardRequest, Ward>();
        CreateMap<Admission, AdmissionDto>()
            .ForMember(d => d.PatientName, o => o.MapFrom(s => s.Patient.User.FullName))
            .ForMember(d => d.PatientNumber, o => o.MapFrom(s => s.Patient.PatientNumber))
            .ForMember(d => d.WardName, o => o.MapFrom(s => s.Ward.Name))
            .ForMember(d => d.BedNumber, o => o.MapFrom(s => s.Bed.BedNumber));

        // Billing mappings
        CreateMap<Invoice, InvoiceDto>()
            .ForMember(d => d.PatientName, o => o.MapFrom(s => s.Patient.User.FullName))
            .ForMember(d => d.PatientNumber, o => o.MapFrom(s => s.Patient.PatientNumber))
            .ForMember(d => d.DueAmount, o => o.MapFrom(s => s.DueAmount));
        CreateMap<InvoiceItem, InvoiceItemDto>()
            .ForMember(d => d.Amount, o => o.MapFrom(s => s.Amount));
        CreateMap<Payment, PaymentDto>();
        CreateMap<CreateInvoiceRequest, Invoice>();
        CreateMap<CreateInvoiceItemRequest, InvoiceItem>();

        // AuditLog mappings
        CreateMap<AuditLog, AuditLogDto>()
            .ForMember(d => d.UserFullName, o => o.MapFrom(s => s.User != null ? s.User.FullName : "System"))
            .ForMember(d => d.UserEmail, o => o.MapFrom(s => s.User != null ? s.User.Email : "system@medicare.com"));

        // Setting mappings
        CreateMap<HospitalSetting, HospitalSettingDto>();
    }
}

