using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class PharmacyInventory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int PharmacyId { get; set; }

        [ForeignKey("PharmacyId")]
        public Pharmacy? Pharmacy { get; set; }

        [Required]
        public int MedicineId { get; set; }

        [ForeignKey("MedicineId")]
        public Medicine? Medicine { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Required]
        public DateTime ExpiryDate { get; set; }

        [Required]
        public int ReorderLevel { get; set; } = 10;
    }
}
