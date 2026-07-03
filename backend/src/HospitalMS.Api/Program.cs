using Serilog;
using HospitalMS.Application;
using HospitalMS.Infrastructure;
using HospitalMS.Api.Extensions;
using HospitalMS.Api.Middleware;
using HospitalMS.Api.Services;
using HospitalMS.Domain.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/hospital_ms_log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add Clean Architecture Layers
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);

// Register API-specific service implementations
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

// Add Controllers
builder.Services.AddControllers();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "MediCare HMS API v1");
    c.RoutePrefix = "swagger";
});

// Middleware order: Exception -> Routing -> CORS -> Auth -> Controllers
app.UseMiddleware<ExceptionMiddleware>();

app.UseHttpsRedirection();

app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Programmatic DB Seeding
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<HospitalMS.Infrastructure.Data.HospitalDbContext>();
        await HospitalMS.Infrastructure.Data.DatabaseSeeder.SeedAsync(context);
        Log.Information("Database seeding completed successfully.");
    }
    catch (Exception ex)
    {
        Log.Error(ex, "An error occurred while seeding the database.");
    }
}

try
{
    Log.Information("Starting MediCare Hospital Management System API...");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Host terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
