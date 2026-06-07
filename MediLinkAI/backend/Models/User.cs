using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty; // Admin, Doctor, Receptionist, Patient, Pharmacist

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
