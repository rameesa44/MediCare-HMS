using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using HospitalMS.Domain.Interfaces;
using HospitalMS.Application.Interfaces;
using HospitalMS.Infrastructure.Data;
using HospitalMS.Infrastructure.Repositories;
using HospitalMS.Infrastructure.Services;

namespace HospitalMS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        
        services.AddDbContext<HospitalDbContext>(options =>
            options.UseNpgsql(connectionString, b => 
                b.MigrationsAssembly(typeof(HospitalDbContext).Assembly.FullName)));

        // Repositories & Unit of Work
        services.AddScoped(typeof(IRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Services
        services.AddTransient<IEmailService, EmailService>();

        return services;
    }
}
