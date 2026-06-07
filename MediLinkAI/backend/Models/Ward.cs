using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Ward
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Type { get; set; } = string.Empty; // ICU, General, Pediatric, Maternity

        [Required]
        public int TotalBeds { get; set; }

        public ICollection<Bed> Beds { get; set; } = new List<Bed>();
    }
}
