using HospitalMS.Domain.Entities;
using HospitalMS.Domain.Interfaces;
using HospitalMS.Infrastructure.Data;

namespace HospitalMS.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly HospitalDbContext _dbContext;

    private IRepository<User>? _users;
    private IRepository<Department>? _departments;
    private IRepository<Doctor>? _doctors;
    private IRepository<Patient>? _patients;
    private IRepository<Staff>? _staffMembers;
    private IRepository<Appointment>? _appointments;
    private IRepository<DoctorSchedule>? _doctorSchedules;
    private IRepository<Token>? _tokens;
    private IRepository<MedicalRecord>? _medicalRecords;
    private IRepository<Prescription>? _prescriptions;
    private IRepository<PatientVital>? _patientVitals;
    private IRepository<PatientDocument>? _patientDocuments;
    private IRepository<Ward>? _wards;
    private IRepository<Bed>? _beds;
    private IRepository<Admission>? _admissions;
    private IRepository<DailyNote>? _dailyNotes;
    private IRepository<MedicineAdministration>? _medicineAdministrations;
    private IRepository<Invoice>? _invoices;
    private IRepository<InvoiceItem>? _invoiceItems;
    private IRepository<Payment>? _payments;
    private IRepository<Notification>? _notifications;
    private IRepository<AuditLog>? _auditLogs;
    private IRepository<HospitalSetting>? _hospitalSettings;
    private IRepository<News>? _news;
    private IRepository<Testimonial>? _testimonials;
    private IRepository<ContactMessage>? _contactMessages;

    public UnitOfWork(HospitalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IRepository<User> Users => _users ??= new GenericRepository<User>(_dbContext);
    public IRepository<Department> Departments => _departments ??= new GenericRepository<Department>(_dbContext);
    public IRepository<Doctor> Doctors => _doctors ??= new GenericRepository<Doctor>(_dbContext);
    public IRepository<Patient> Patients => _patients ??= new GenericRepository<Patient>(_dbContext);
    public IRepository<Staff> StaffMembers => _staffMembers ??= new GenericRepository<Staff>(_dbContext);
    public IRepository<Appointment> Appointments => _appointments ??= new GenericRepository<Appointment>(_dbContext);
    public IRepository<DoctorSchedule> DoctorSchedules => _doctorSchedules ??= new GenericRepository<DoctorSchedule>(_dbContext);
    public IRepository<Token> Tokens => _tokens ??= new GenericRepository<Token>(_dbContext);
    public IRepository<MedicalRecord> MedicalRecords => _medicalRecords ??= new GenericRepository<MedicalRecord>(_dbContext);
    public IRepository<Prescription> Prescriptions => _prescriptions ??= new GenericRepository<Prescription>(_dbContext);
    public IRepository<PatientVital> PatientVitals => _patientVitals ??= new GenericRepository<PatientVital>(_dbContext);
    public IRepository<PatientDocument> PatientDocuments => _patientDocuments ??= new GenericRepository<PatientDocument>(_dbContext);
    public IRepository<Ward> Wards => _wards ??= new GenericRepository<Ward>(_dbContext);
    public IRepository<Bed> Beds => _beds ??= new GenericRepository<Bed>(_dbContext);
    public IRepository<Admission> Admissions => _admissions ??= new GenericRepository<Admission>(_dbContext);
    public IRepository<DailyNote> DailyNotes => _dailyNotes ??= new GenericRepository<DailyNote>(_dbContext);
    public IRepository<MedicineAdministration> MedicineAdministrations => _medicineAdministrations ??= new GenericRepository<MedicineAdministration>(_dbContext);
    public IRepository<Invoice> Invoices => _invoices ??= new GenericRepository<Invoice>(_dbContext);
    public IRepository<InvoiceItem> InvoiceItems => _invoiceItems ??= new GenericRepository<InvoiceItem>(_dbContext);
    public IRepository<Payment> Payments => _payments ??= new GenericRepository<Payment>(_dbContext);
    public IRepository<Notification> Notifications => _notifications ??= new GenericRepository<Notification>(_dbContext);
    public IRepository<AuditLog> AuditLogs => _auditLogs ??= new GenericRepository<AuditLog>(_dbContext);
    public IRepository<HospitalSetting> HospitalSettings => _hospitalSettings ??= new GenericRepository<HospitalSetting>(_dbContext);
    public IRepository<News> News => _news ??= new GenericRepository<News>(_dbContext);
    public IRepository<Testimonial> Testimonials => _testimonials ??= new GenericRepository<Testimonial>(_dbContext);
    public IRepository<ContactMessage> ContactMessages => _contactMessages ??= new GenericRepository<ContactMessage>(_dbContext);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public void Dispose()
    {
        _dbContext.Dispose();
        GC.SuppressFinalize(this);
    }
}
