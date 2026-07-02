using AutoMapper;
using HospitalMS.Domain.Entities;
using HospitalMS.Application.DTOs.Auth;
using HospitalMS.Application.DTOs.Department;
using HospitalMS.Application.DTOs.Doctor;
using HospitalMS.Application.DTOs.Patient;

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
    }
}
