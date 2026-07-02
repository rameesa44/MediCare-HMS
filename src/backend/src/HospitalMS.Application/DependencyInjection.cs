using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace HospitalMS.Application;

/// <summary>
/// Registers Application layer services into the DI container.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // AutoMapper
        services.AddAutoMapper(cfg => {}, typeof(DependencyInjection));

        // FluentValidation — auto-discover all validators in this assembly
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        return services;
    }
}
