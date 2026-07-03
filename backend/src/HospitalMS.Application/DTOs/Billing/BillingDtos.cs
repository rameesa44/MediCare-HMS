using System;
using System.Collections.Generic;
using HospitalMS.Domain.Enums;

namespace HospitalMS.Application.DTOs.Billing;

public class InvoiceDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientNumber { get; set; } = string.Empty;
    public Guid? AppointmentId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal DueAmount { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTime InvoiceDate { get; set; }
    public DateTime? DueDate { get; set; }
    public string? GeneratedBy { get; set; }
    public string? Notes { get; set; }
    public List<InvoiceItemDto> Items { get; set; } = [];
    public List<PaymentDto> Payments { get; set; } = [];
}

public class InvoiceItemDto
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Amount { get; set; }
}

public class PaymentDto
{
    public Guid Id { get; set; }
    public Guid InvoiceId { get; set; }
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string? TransactionId { get; set; }
    public DateTime PaidAt { get; set; }
    public string? ReceivedBy { get; set; }
    public string? Notes { get; set; }
}

public class CreateInvoiceRequest
{
    public Guid PatientId { get; set; }
    public Guid? AppointmentId { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxAmount { get; set; }
    public string? Notes { get; set; }
    public List<CreateInvoiceItemRequest> Items { get; set; } = [];
}

public class CreateInvoiceItemRequest
{
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
}

public class RecordPaymentRequest
{
    public decimal Amount { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string? TransactionId { get; set; }
    public string? Notes { get; set; }
}
