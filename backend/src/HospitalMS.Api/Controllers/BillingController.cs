using Asp.Versioning;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HospitalMS.Application.Common;
using HospitalMS.Application.DTOs.Billing;
using HospitalMS.Domain.Interfaces;
using HospitalMS.Domain.Entities;
using HospitalMS.Domain.Enums;
using HospitalMS.Domain.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HospitalMS.Api.Controllers;

[ApiVersion("1.0")]
public class BillingController : ApiControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public BillingController(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    [HttpGet("invoices")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<InvoiceDto>>>> GetInvoices([FromQuery] Guid? patientId)
    {
        var query = _unitOfWork.Invoices.Query()
            .Include(i => i.Patient).ThenInclude(p => p.User)
            .Include(i => i.Items)
            .Include(i => i.Payments)
            .AsQueryable();

        if (patientId.HasValue)
        {
            query = query.Where(i => i.PatientId == patientId.Value);
        }

        var invoices = await query.ToListAsync();
        var dtos = _mapper.Map<IReadOnlyList<InvoiceDto>>(invoices);
        return OkResponse(dtos);
    }

    [HttpGet("invoices/{id}")]
    public async Task<ActionResult<ApiResponse<InvoiceDto>>> GetInvoiceById(Guid id)
    {
        var invoice = await _unitOfWork.Invoices.Query()
            .Include(i => i.Patient).ThenInclude(p => p.User)
            .Include(i => i.Items)
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (invoice == null)
            throw new NotFoundException($"Invoice with ID {id} not found.");

        var dto = _mapper.Map<InvoiceDto>(invoice);
        return OkResponse(dto);
    }

    [HttpPost("invoices")]
    public async Task<ActionResult<ApiResponse<InvoiceDto>>> CreateInvoice([FromBody] CreateInvoiceRequest request)
    {
        var patientExists = await _unitOfWork.Patients.AnyAsync(p => p.Id == request.PatientId);
        if (!patientExists)
            throw new NotFoundException($"Patient with ID {request.PatientId} not found.");

        var invoice = _mapper.Map<Invoice>(request);
        invoice.Id = Guid.NewGuid();
        invoice.InvoiceNumber = "INV-" + new Random().Next(100000, 999999).ToString();
        invoice.InvoiceDate = DateTime.UtcNow;
        invoice.DueDate = DateTime.UtcNow.AddDays(15);
        invoice.GeneratedBy = "Billing Department";
        invoice.PaidAmount = 0.00m;
        invoice.Status = PaymentStatus.Pending;

        // Add items and calculate amount
        decimal baseAmount = 0.00m;
        foreach (var itemReq in request.Items)
        {
            var item = _mapper.Map<InvoiceItem>(itemReq);
            item.Id = Guid.NewGuid();
            item.InvoiceId = invoice.Id;
            invoice.Items.Add(item);
            baseAmount += item.Amount;
        }

        invoice.TotalAmount = baseAmount;

        await _unitOfWork.Invoices.AddAsync(invoice);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Issued Invoice: {invoice.InvoiceNumber} for amount: {invoice.TotalAmount}",
            EntityName = "Invoice",
            EntityId = invoice.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        var created = await _unitOfWork.Invoices.Query()
            .Include(i => i.Patient).ThenInclude(p => p.User)
            .Include(i => i.Items)
            .Include(i => i.Payments)
            .FirstAsync(i => i.Id == invoice.Id);

        var dto = _mapper.Map<InvoiceDto>(created);
        return CreatedResponse(dto, "Invoice generated successfully.");
    }

    [HttpPost("invoices/{invoiceId}/payments")]
    public async Task<ActionResult<ApiResponse<InvoiceDto>>> RecordPayment(Guid invoiceId, [FromBody] RecordPaymentRequest request)
    {
        var invoice = await _unitOfWork.Invoices.Query()
            .Include(i => i.Patient).ThenInclude(p => p.User)
            .Include(i => i.Items)
            .Include(i => i.Payments)
            .FirstOrDefaultAsync(i => i.Id == invoiceId);

        if (invoice == null)
            throw new NotFoundException($"Invoice with ID {invoiceId} not found.");

        if (invoice.Status == PaymentStatus.Paid)
            throw new BadRequestException("Invoice is already fully paid.");

        // Record payment
        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            InvoiceId = invoiceId,
            Amount = request.Amount,
            PaymentMethod = request.PaymentMethod,
            TransactionId = request.TransactionId ?? "TXN-" + new Random().Next(10000000, 99999999).ToString(),
            PaidAt = DateTime.UtcNow,
            ReceivedBy = "Billing Agent",
            Notes = request.Notes
        };
        await _unitOfWork.Payments.AddAsync(payment);

        invoice.PaidAmount += request.Amount;

        decimal netAmount = invoice.TotalAmount - invoice.DiscountAmount + invoice.TaxAmount;
        if (invoice.PaidAmount >= netAmount)
        {
            invoice.Status = PaymentStatus.Paid;
        }
        else if (invoice.PaidAmount > 0)
        {
            invoice.Status = PaymentStatus.PartiallyPaid;
        }

        _unitOfWork.Invoices.Update(invoice);

        // Add Audit Log
        await _unitOfWork.AuditLogs.AddAsync(new AuditLog
        {
            Id = Guid.NewGuid(),
            Action = $"Recorded Payment: {payment.Amount} on Invoice: {invoice.InvoiceNumber}",
            EntityName = "Payment",
            EntityId = payment.Id.ToString()
        });

        await _unitOfWork.SaveChangesAsync();

        var updated = await _unitOfWork.Invoices.Query()
            .Include(i => i.Patient).ThenInclude(p => p.User)
            .Include(i => i.Items)
            .Include(i => i.Payments)
            .FirstAsync(i => i.Id == invoiceId);

        var dto = _mapper.Map<InvoiceDto>(updated);
        return OkResponse(dto, "Payment recorded successfully.");
    }
}
