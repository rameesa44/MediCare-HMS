using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == model.Email.ToLower()))
            {
                return BadRequest(new { message = "Email is already registered." });
            }

            // Create User Entity
            var user = new User
            {
                Email = model.Email,
                PasswordHash = HashPassword(model.Password),
                Role = model.Role,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync(); // Save user first to get User.Id

            try
            {
                // Create corresponding role profile
                if (model.Role.Equals("Patient", StringComparison.OrdinalIgnoreCase))
                {
                    var patient = new Patient
                    {
                        UserId = user.Id,
                        Name = model.Name,
                        Age = model.Age ?? 0,
                        Gender = model.Gender ?? "Unknown",
                        BloodGroup = model.BloodGroup ?? string.Empty,
                        ContactNo = model.ContactNo ?? string.Empty,
                        Address = model.Address ?? string.Empty,
                        EmergencyContact = model.EmergencyContact ?? string.Empty
                    };
                    await _context.Patients.AddAsync(patient);
                }
                else if (model.Role.Equals("Doctor", StringComparison.OrdinalIgnoreCase))
                {
                    var doctor = new Doctor
                    {
                        UserId = user.Id,
                        Name = model.Name,
                        Specialization = model.Specialization ?? string.Empty,
                        LicenseNo = model.LicenseNo ?? string.Empty,
                        ConsultationFee = model.ConsultationFee ?? 0,
                        Availability = model.Availability ?? "Mon-Fri 9:00 AM - 5:00 PM"
                    };
                    await _context.Doctors.AddAsync(doctor);
                }
                else // Admin, Receptionist, Nurse, Pharmacist
                {
                    var staff = new Staff
                    {
                        UserId = user.Id,
                        Name = model.Name,
                        Role = model.Role,
                        Department = model.Department ?? "General",
                        Shift = model.Shift ?? "Morning"
                    };
                    await _context.StaffMembers.AddAsync(staff);
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Rollback user creation on profile failure
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                return StatusCode(500, new { message = "Error creating profile. Registration rolled back.", details = ex.Message });
            }

            return Ok(new { message = "Registration successful." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == model.Email.ToLower());
            if (user == null || !VerifyPassword(model.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            // Generate JWT Token
            var token = GenerateJwtToken(user);

            // Fetch display name based on profile
            string displayName = "User";
            if (user.Role.Equals("Patient", StringComparison.OrdinalIgnoreCase))
            {
                var patient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == user.Id);
                if (patient != null) displayName = patient.Name;
            }
            else if (user.Role.Equals("Doctor", StringComparison.OrdinalIgnoreCase))
            {
                var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == user.Id);
                if (doctor != null) displayName = doctor.Name;
            }
            else
            {
                var staff = await _context.StaffMembers.FirstOrDefaultAsync(s => s.UserId == user.Id);
                if (staff != null) displayName = staff.Name;
            }

            return Ok(new
            {
                token,
                role = user.Role,
                email = user.Email,
                displayName
            });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is missing from configuration.");
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? "MediLinkAI_Backend";
            var jwtAudience = _configuration["Jwt:Audience"] ?? "MediLinkAI_Clients";

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(password);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }

        private bool VerifyPassword(string password, string passwordHash)
        {
            return HashPassword(password) == passwordHash;
        }
    }

    // Data Transfer Objects
    public class RegisterDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty; // Admin, Doctor, Receptionist, Patient, Pharmacist
        public string Name { get; set; } = string.Empty;

        // Patient Specific Fields
        public int? Age { get; set; }
        public string? Gender { get; set; }
        public string? BloodGroup { get; set; }
        public string? ContactNo { get; set; }
        public string? Address { get; set; }
        public string? EmergencyContact { get; set; }

        // Doctor Specific Fields
        public string? Specialization { get; set; }
        public string? LicenseNo { get; set; }
        public decimal? ConsultationFee { get; set; }
        public string? Availability { get; set; }

        // Staff Specific Fields
        public string? Department { get; set; }
        public string? Shift { get; set; }
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
