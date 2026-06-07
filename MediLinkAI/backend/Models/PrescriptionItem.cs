using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class PrescriptionItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PrescriptionId { get; set; }

        [ForeignKey("PrescriptionId")]
        [JsonIgnore] // Avoid circular reference
        public Prescription? Prescription { get; set; }

        [Required]
        public int MedicineId { get; set; }

        [ForeignKey("MedicineId")]
        public Medicine? Medicine { get; set; }

        [Required]
        [StringLength(50)]
        public string Dosage { get; set; } = string.Empty; // e.g., "500mg" or "1 tablet"

        [Required]
        [StringLength(100)]
        public string Frequency { get; set; } = string.Empty; // e.g., "Three times a day"

        [Required]
        [StringLength(50)]
        public string Duration { get; set; } = string.Empty; // e.g., "5 days" or "1 week"
    }
}
