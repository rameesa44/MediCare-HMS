using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Pharmacy
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Address { get; set; } = string.Empty;

        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        [Required]
        [StringLength(20)]
        public string ContactNo { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string LicenseNo { get; set; } = string.Empty;
    }
}
