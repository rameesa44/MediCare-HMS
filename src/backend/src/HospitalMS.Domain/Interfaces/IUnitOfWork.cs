using HospitalMS.Domain.Entities;

namespace HospitalMS.Domain.Interfaces;

/// <summary>
/// Unit of Work pattern — coordinates multiple repository operations 
/// within a single database transaction.
/// </summary>
public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IRepository<Department> Departments { get; }
    IRepository<Doctor> Doctors { get; }
    IRepository<Patient> Patients { get; }
    IRepository<Staff> StaffMembers { get; }
    IRepository<Appointment> Appointments { get; }
    IRepository<DoctorSchedule> DoctorSchedules { get; }
    IRepository<Token> Tokens { get; }
    IRepository<MedicalRecord> MedicalRecords { get; }
    IRepository<Prescription> Prescriptions { get; }
    IRepository<PatientVital> PatientVitals { get; }
    IRepository<PatientDocument> PatientDocuments { get; }
    IRepository<Ward> Wards { get; }
    IRepository<Bed> Beds { get; }
    IRepository<Admission> Admissions { get; }
    IRepository<DailyNote> DailyNotes { get; }
    IRepository<MedicineAdministration> MedicineAdministrations { get; }
    IRepository<Invoice> Invoices { get; }
    IRepository<InvoiceItem> InvoiceItems { get; }
    IRepository<Payment> Payments { get; }
    IRepository<Notification> Notifications { get; }
    IRepository<AuditLog> AuditLogs { get; }
    IRepository<HospitalSetting> HospitalSettings { get; }
    IRepository<News> News { get; }
    IRepository<Testimonial> Testimonials { get; }
    IRepository<ContactMessage> ContactMessages { get; }

    /// <summary>
    /// Commits all changes made through repositories in this unit of work.
    /// </summary>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
