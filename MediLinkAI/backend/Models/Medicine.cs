using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Medicine
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string GenericName { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string Formula { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Category { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Manufacturer { get; set; } = string.Empty;

        [StringLength(500)]
        public string SideEffects { get; set; } = string.Empty;
    }
}
