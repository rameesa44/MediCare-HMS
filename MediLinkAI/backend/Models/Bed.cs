using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class Bed
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int WardId { get; set; }

        [ForeignKey("WardId")]
        [JsonIgnore] // Avoid circular reference
        public Ward? Ward { get; set; }

        [Required]
        [StringLength(20)]
        public string BedNumber { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Available"; // Available, Occupied, Maintenance
    }
}
