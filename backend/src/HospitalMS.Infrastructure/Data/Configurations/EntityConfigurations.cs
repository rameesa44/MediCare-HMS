using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using HospitalMS.Domain.Entities;

namespace HospitalMS.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasIndex(u => u.Email).IsUnique();
        
        builder.Property(u => u.FirstName).HasMaxLength(100).IsRequired();
        builder.Property(u => u.LastName).HasMaxLength(100).IsRequired();
        builder.Property(u => u.Email).HasMaxLength(150).IsRequired();
        builder.Property(u => u.PasswordHash).IsRequired();

        // 1-to-1 relationships
        builder.HasOne(u => u.Doctor)
            .WithOne(d => d.User)
            .HasForeignKey<Doctor>(d => d.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(u => u.Patient)
            .WithOne(p => p.User)
            .HasForeignKey<Patient>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(u => u.Staff)
            .WithOne(s => s.User)
            .HasForeignKey<Staff>(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.Property(d => d.Name).HasMaxLength(100).IsRequired();
        builder.Property(d => d.Description).HasMaxLength(500);

        builder.HasOne(d => d.HeadDoctor)
            .WithMany()
            .HasForeignKey(d => d.HeadDoctorId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class DoctorConfiguration : IEntityTypeConfiguration<Doctor>
{
    public void Configure(EntityTypeBuilder<Doctor> builder)
    {
        builder.Property(d => d.Specialization).HasMaxLength(150).IsRequired();
        builder.Property(d => d.Qualification).HasMaxLength(250);
        builder.Property(d => d.LicenseNumber).HasMaxLength(100);
        builder.Property(d => d.ConsultationFee).HasPrecision(18, 2);

        builder.HasOne(d => d.Department)
            .WithMany(dept => dept.Doctors)
            .HasForeignKey(d => d.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class PatientConfiguration : IEntityTypeConfiguration<Patient>
{
    public void Configure(EntityTypeBuilder<Patient> builder)
    {
        builder.HasIndex(p => p.PatientNumber).IsUnique();
        builder.Property(p => p.PatientNumber).HasMaxLength(50).IsRequired();
        builder.Property(p => p.Address).HasMaxLength(250);
        builder.Property(p => p.City).HasMaxLength(100);
        builder.Property(p => p.State).HasMaxLength(100);
        builder.Property(p => p.ZipCode).HasMaxLength(20);
        builder.Property(p => p.EmergencyContactName).HasMaxLength(100);
        builder.Property(p => p.EmergencyContactPhone).HasMaxLength(30);
        builder.Property(p => p.InsuranceProvider).HasMaxLength(150);
        builder.Property(p => p.InsuranceNumber).HasMaxLength(100);
    }
}

public class AppointmentConfiguration : IEntityTypeConfiguration<Appointment>
{
    public void Configure(EntityTypeBuilder<Appointment> builder)
    {
        builder.HasOne(a => a.Patient)
            .WithMany(p => p.Appointments)
            .HasForeignKey(a => a.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Doctor)
            .WithMany(d => d.Appointments)
            .HasForeignKey(a => a.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Department)
            .WithMany(dept => dept.Appointments)
            .HasForeignKey(a => a.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Token)
            .WithOne(t => t.Appointment)
            .HasForeignKey<Token>(t => t.AppointmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.MedicalRecord)
            .WithOne(m => m.Appointment)
            .HasForeignKey<MedicalRecord>(m => m.AppointmentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}

public class WardAndBedConfiguration : IEntityTypeConfiguration<Ward>, IEntityTypeConfiguration<Bed>
{
    public void Configure(EntityTypeBuilder<Ward> builder)
    {
        builder.Property(w => w.Name).HasMaxLength(100).IsRequired();
        builder.Property(w => w.Type).HasMaxLength(50);

        builder.HasMany(w => w.Beds)
            .WithOne(b => b.Ward)
            .HasForeignKey(b => b.WardId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public void Configure(EntityTypeBuilder<Bed> builder)
    {
        builder.Property(b => b.BedNumber).HasMaxLength(50).IsRequired();
    }
}

public class AdmissionConfiguration : IEntityTypeConfiguration<Admission>
{
    public void Configure(EntityTypeBuilder<Admission> builder)
    {
        builder.HasOne(a => a.Patient)
            .WithMany(p => p.Admissions)
            .HasForeignKey(a => a.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Doctor)
            .WithMany(d => d.Admissions)
            .HasForeignKey(a => a.DoctorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Ward)
            .WithMany(w => w.Admissions)
            .HasForeignKey(a => a.WardId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Bed)
            .WithMany(b => b.Admissions)
            .HasForeignKey(a => a.BedId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class InvoiceConfiguration : IEntityTypeConfiguration<Invoice>
{
    public void Configure(EntityTypeBuilder<Invoice> builder)
    {
        builder.HasIndex(i => i.InvoiceNumber).IsUnique();
        builder.Property(i => i.InvoiceNumber).HasMaxLength(50).IsRequired();
        builder.Property(i => i.TotalAmount).HasPrecision(18, 2);
        builder.Property(i => i.DiscountAmount).HasPrecision(18, 2);
        builder.Property(i => i.TaxAmount).HasPrecision(18, 2);
        builder.Property(i => i.PaidAmount).HasPrecision(18, 2);

        builder.HasOne(i => i.Patient)
            .WithMany(p => p.Invoices)
            .HasForeignKey(i => i.PatientId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.Appointment)
            .WithOne(a => a.Invoice)
            .HasForeignKey<Invoice>(i => i.AppointmentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(i => i.Items)
            .WithOne(item => item.Invoice)
            .HasForeignKey(item => item.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(i => i.Payments)
            .WithOne(p => p.Invoice)
            .HasForeignKey(p => p.InvoiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class InvoiceItemConfiguration : IEntityTypeConfiguration<InvoiceItem>
{
    public void Configure(EntityTypeBuilder<InvoiceItem> builder)
    {
        builder.Property(ii => ii.Description).HasMaxLength(250).IsRequired();
        builder.Property(ii => ii.UnitPrice).HasPrecision(18, 2);
    }
}

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.Property(p => p.Amount).HasPrecision(18, 2);
        builder.Property(p => p.TransactionId).HasMaxLength(150);
    }
}

public class StaffConfiguration : IEntityTypeConfiguration<Staff>
{
    public void Configure(EntityTypeBuilder<Staff> builder)
    {
        builder.Property(s => s.Designation).HasMaxLength(100).IsRequired();
        builder.Property(s => s.EmployeeId).HasMaxLength(50);

        builder.HasOne(s => s.Department)
            .WithMany(dept => dept.Staff)
            .HasForeignKey(s => s.DepartmentId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(s => s.AssignedWard)
            .WithMany(w => w.AssignedStaff)
            .HasForeignKey(s => s.AssignedWardId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
