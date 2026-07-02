using HospitalMS.Domain.Common;
using HospitalMS.Domain.Enums;

namespace HospitalMS.Domain.Entities;

/// <summary>
/// Invoice/bill generated for patient services.
/// </summary>
public class Invoice : BaseEntity
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;

    public Guid? AppointmentId { get; set; }
    public Appointment? Appointment { get; set; }

    public Guid? AdmissionId { get; set; }

    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal DueAmount => TotalAmount - DiscountAmount + TaxAmount - PaidAmount;

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public DateTime? DueDate { get; set; }
    public string? GeneratedBy { get; set; }
    public string? Notes { get; set; }

    // Navigation
    public ICollection<InvoiceItem> Items { get; set; } = [];
    public ICollection<Payment> Payments { get; set; } = [];
}

/// <summary>
/// Individual line item on an invoice.
/// </summary>
public class InvoiceItem : BaseEntity
{
    public Guid InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = null!;

    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal Amount => Quantity * UnitPrice;
}

/// <summary>
/// Payment record against an invoice.
/// </summary>
public class Payment : BaseEntity
{
    public Guid InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = null!;

    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string? TransactionId { get; set; }
    public DateTime PaidAt { get; set; } = DateTime.UtcNow;
    public string? ReceivedBy { get; set; }
    public string? Notes { get; set; }
}
