using BCrypt.Net;
using HospitalMS.Domain.Entities;
using HospitalMS.Domain.Enums;

namespace HospitalMS.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(HospitalDbContext context)
    {
        // For In-Memory or initial SQL setup, ensure database exists
        await context.Database.EnsureCreatedAsync();

        if (context.Users.Any())
        {
            return; // Already seeded
        }

        // 1. Seed Users
        var users = new List<User>
        {
            new User
            {
                Id = Guid.NewGuid(),
                FirstName = "System",
                LastName = "Administrator",
                Email = "admin@medicare.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            },
            new User
            {
                Id = Guid.NewGuid(),
                FirstName = "John",
                LastName = "Smith",
                Email = "doctor@medicare.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Doctor123!"),
                Role = UserRole.Doctor,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            },
            new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Sarah",
                LastName = "Jones",
                Email = "reception@medicare.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Reception123!"),
                Role = UserRole.Receptionist,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            },
            new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Emma",
                LastName = "Wilson",
                Email = "ward@medicare.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Ward123!"),
                Role = UserRole.WardStaff,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            },
            new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Robert",
                LastName = "Taylor",
                Email = "patient@medicare.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Patient123!"),
                Role = UserRole.Patient,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            }
        };

        await context.Users.AddRangeAsync(users);
        await context.SaveChangesAsync();

        // 2. Seed Departments
        var cardiology = new Department
        {
            Id = Guid.NewGuid(),
            Name = "Cardiology",
            Description = "Department specializing in cardiovascular care, diagnostics and treatment.",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "System"
        };
        var pediatrics = new Department
        {
            Id = Guid.NewGuid(),
            Name = "Pediatrics",
            Description = "General medical care and specialty services for children and adolescents.",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "System"
        };
        await context.Departments.AddRangeAsync(cardiology, pediatrics);
        await context.SaveChangesAsync();

        // 3. Link Doctor/Patient role entities
        var docUser = users.First(u => u.Role == UserRole.Doctor);
        var doctor = new Doctor
        {
            Id = Guid.NewGuid(),
            UserId = docUser.Id,
            DepartmentId = cardiology.Id,
            Specialization = "Cardiologist",
            Qualification = "MD, FACC",
            ConsultationFee = 150.00m,
            IsAvailable = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "System"
        };
        await context.Doctors.AddAsync(doctor);

        var patientUser = users.First(u => u.Role == UserRole.Patient);
        var patient = new Patient
        {
            Id = Guid.NewGuid(),
            UserId = patientUser.Id,
            PatientNumber = "P-10001",
            DateOfBirth = new DateTime(1975, 1, 30).ToUniversalTime(),
            Gender = Gender.Male,
            BloodGroup = BloodGroup.OPositive,
            Address = "123 Health Ave",
            City = "Boston",
            State = "MA",
            ZipCode = "02115",
            EmergencyContactName = "Jane Taylor",
            EmergencyContactPhone = "555-0199",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "System"
        };
        await context.Patients.AddAsync(patient);

        var wardUser = users.First(u => u.Role == UserRole.WardStaff);
        var staff = new Staff
        {
            Id = Guid.NewGuid(),
            UserId = wardUser.Id,
            Designation = "Senior Ward Nurse",
            EmployeeId = "EMP-903",
            DepartmentId = cardiology.Id,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "System"
        };
        await context.StaffMembers.AddAsync(staff);

        await context.SaveChangesAsync();

        // 4. Seed Wards & Beds
        var wardA = new Ward
        {
            Id = Guid.NewGuid(),
            Name = "General Cardiology Ward A",
            Type = "Cardiology",
            TotalBeds = 5,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "System"
        };
        await context.Wards.AddAsync(wardA);
        await context.SaveChangesAsync();

        var beds = new List<Bed>
        {
            new Bed { Id = Guid.NewGuid(), WardId = wardA.Id, BedNumber = "B-101", Status = BedStatus.Available, CreatedAt = DateTime.UtcNow, CreatedBy = "System" },
            new Bed { Id = Guid.NewGuid(), WardId = wardA.Id, BedNumber = "B-102", Status = BedStatus.Available, CreatedAt = DateTime.UtcNow, CreatedBy = "System" },
            new Bed { Id = Guid.NewGuid(), WardId = wardA.Id, BedNumber = "B-103", Status = BedStatus.Available, CreatedAt = DateTime.UtcNow, CreatedBy = "System" }
        };
        await context.Beds.AddRangeAsync(beds);
        await context.SaveChangesAsync();
    }
}
