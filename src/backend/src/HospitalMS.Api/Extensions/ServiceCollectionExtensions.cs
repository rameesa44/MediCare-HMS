using System.Text;
using Asp.Versioning;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

namespace HospitalMS.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Add HttpContextAccessor
        services.AddHttpContextAccessor();

        // Configure API Versioning
        services.AddApiVersioning(options =>
        {
            options.DefaultApiVersion = new ApiVersion(1, 0);
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.ReportApiVersions = true;
            options.ApiVersionReader = ApiVersionReader.Combine(
                new UrlSegmentApiVersionReader(),
                new HeaderApiVersionReader("x-api-version"),
                new QueryStringApiVersionReader("api-version"));
        })
        .AddApiExplorer(options =>
        {
            options.GroupNameFormat = "'v'VVV";
            options.SubstituteApiVersionInUrl = true;
        });

        // Configure JWT Authentication
        var jwtSettings = configuration.GetSection("Jwt");
        var secret = jwtSettings.GetValue<string>("Secret") ?? "SuperSecretKeyForMediCareHospitalSystem2026!!!";
        var key = Encoding.ASCII.GetBytes(secret);

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false; // Set to true in production
            options.SaveToken = true;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = jwtSettings.GetValue<string>("Issuer") ?? "MediCareHospital",
                ValidateAudience = true,
                ValidAudience = jwtSettings.GetValue<string>("Audience") ?? "MediCareHospitalUsers",
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };
        });

        // Configure Swagger with JWT Support
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "MediCare Hospital Management System API",
                Version = "v1",
                Description = "REST API for MediCare HMS. Clean architecture, secure endpoints."
            });

            const string schemeId = "bearer";

            c.AddSecurityDefinition(schemeId, new OpenApiSecurityScheme
            {
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                Description = "JWT Authorization header using the Bearer scheme."
            });

            c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference(schemeId, document)] = new List<string>()
            });
        });

        return services;
    }
}
