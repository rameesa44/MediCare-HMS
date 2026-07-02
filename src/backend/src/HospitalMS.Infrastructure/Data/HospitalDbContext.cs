using System.Reflection;
using Microsoft.EntityFrameworkCore;
using HospitalMS.Domain.Common;
using HospitalMS.Domain.Entities;
using HospitalMS.Domain.Interfaces;

namespace HospitalMS.Infrastructure.Data;

public class HospitalDbContext : DbContext
{
    private readonly ICurrentUserService _currentUserService;

    public HospitalDbContext(
        DbContextOptions<HospitalDbContext> options,
        ICurrentUserService currentUserService) : base(options)
    {
        _currentUserService = currentUserService;
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Staff> StaffMembers => Set<Staff>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<DoctorSchedule> DoctorSchedules => Set<DoctorSchedule>();
    public DbSet<Token> Tokens => Set<Token>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<MedicalRecord> MedicalRecords => Set<MedicalRecord>();
    public DbSet<Prescription> Prescriptions => Set<Prescription>();
    public DbSet<PatientVital> PatientVitals => Set<PatientVital>();
    public DbSet<PatientDocument> PatientDocuments => Set<PatientDocument>();
    public DbSet<Ward> Wards => Set<Ward>();
    public DbSet<Bed> Beds => Set<Bed>();
    public DbSet<Admission> Admissions => Set<Admission>();
    public DbSet<DailyNote> DailyNotes => Set<DailyNote>();
    public DbSet<MedicineAdministration> MedicineAdministrations => Set<MedicineAdministration>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<HospitalSetting> HospitalSettings => Set<HospitalSetting>();
    public DbSet<News> News => Set<News>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        OnBeforeSaving();
        return await base.SaveChangesAsync(cancellationToken);
    }

    private void OnBeforeSaving()
    {
        var entries = ChangeTracker.Entries();
        var utcNow = DateTime.UtcNow;
        var currentUserId = _currentUserService.UserId?.ToString() ?? "System";

        foreach (var entry in entries)
        {
            if (entry.Entity is BaseEntity trackable)
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        trackable.CreatedAt = utcNow;
                        trackable.CreatedBy = currentUserId;
                        trackable.IsDeleted = false;
                        break;

                    case EntityState.Modified:
                        // Ensure we don't overwrite CreatedAt/CreatedBy
                        entry.Property(nameof(BaseEntity.CreatedAt)).IsModified = false;
                        entry.Property(nameof(BaseEntity.CreatedBy)).IsModified = false;
                        
                        trackable.UpdatedAt = utcNow;
                        trackable.UpdatedBy = currentUserId;
                        break;

                    case EntityState.Deleted:
                        // Intercept hard deletes and convert to soft deletes
                        entry.State = EntityState.Modified;
                        trackable.IsDeleted = true;
                        trackable.DeletedAt = utcNow;
                        trackable.DeletedBy = currentUserId;
                        break;
                }
            }
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations from the current assembly
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Configure Global Query Filters for Soft Deletes on all entities inheriting from BaseEntity
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .HasQueryFilter(ConvertFilterExpression(entityType.ClrType));
            }
        }
    }

    private static System.Linq.Expressions.LambdaExpression ConvertFilterExpression(Type type)
    {
        // Generates: e => !e.IsDeleted
        var parameter = System.Linq.Expressions.Expression.Parameter(type, "e");
        var property = System.Linq.Expressions.Expression.Property(parameter, nameof(BaseEntity.IsDeleted));
        var notExpression = System.Linq.Expressions.Expression.Not(property);
        return System.Linq.Expressions.Expression.Lambda(notExpression, parameter);
    }
}
