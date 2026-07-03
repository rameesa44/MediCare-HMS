import React, { useEffect, useState } from "react"
import { CreditCard, Plus, Eye, DollarSign, FileText, Search, Trash2, CheckCircle, Percent } from "lucide-react"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import apiClient from "@/api/client"
import type { ApiResponse } from "@/types"

interface InvoiceItemDto {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

interface PaymentDto {
  id: string
  amount: number
  paymentMethod: number
  transactionId?: string
  paidAt: string
  receivedBy?: string
  notes?: string
}

interface InvoiceDto {
  id: string
  patientId: string
  patientName: string
  patientNumber: string
  appointmentId?: string
  invoiceNumber: string
  totalAmount: decimal
  discountAmount: decimal
  taxAmount: decimal
  paidAmount: decimal
  dueAmount: decimal
  status: number // 1 = Pending, 2 = PartiallyPaid, 3 = Paid, 4 = Overdue, 5 = Refunded
  invoiceDate: string
  dueDate?: string
  generatedBy?: string
  notes?: string
  items: InvoiceItemDto[]
  payments: PaymentDto[]
}

interface PatientDto { id: string; patientName: string; patientNumber: string }

const PAYMENT_STATUS_LABELS: Record<number, string> = {
  1: "Pending",
  2: "Partially Paid",
  3: "Paid",
  4: "Overdue",
  5: "Refunded",
}

const PAYMENT_STATUS_CLASSES: Record<number, string> = {
  1: "bg-yellow-500/10 text-yellow-500",
  2: "bg-blue-500/10 text-blue-500",
  3: "bg-green-500/10 text-green-500",
  4: "bg-destructive/10 text-destructive",
  5: "bg-purple-500/10 text-purple-500",
}

const PAYMENT_METHOD_LABELS: Record<number, string> = {
  1: "Cash",
  2: "Card",
  3: "Bank Transfer",
  4: "Insurance",
  5: "Online",
}

export const BillingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceDto[]>([])
  const [patients, setPatients] = useState<PatientDto[]>([])
  const [filtered, setFiltered] = useState<InvoiceDto[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  // Create Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [discountAmount, setDiscountAmount] = useState<number>(0)
  const [taxAmount, setTaxAmount] = useState<number>(0)
  const [invoiceNotes, setInvoiceNotes] = useState("")
  
  // Dynamic Invoice Items Builder
  const [itemsList, setItemsList] = useState<{ description: string; quantity: number; unitPrice: number }[]>([
    { description: "General Consultation Fee", quantity: 1, unitPrice: 50 },
  ])

  // Record Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [activeInvoice, setActiveInvoice] = useState<InvoiceDto | null>(null)
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState(1)
  const [transactionId, setTransactionId] = useState("")
  const [paymentNotes, setPaymentNotes] = useState("")

  // View Details Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewInvoice, setViewInvoice] = useState<InvoiceDto | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [invoicesRes, patientsRes] = await Promise.all([
        apiClient.get<ApiResponse<InvoiceDto[]>>("/billing/invoices"),
        apiClient.get<ApiResponse<PatientDto[]>>("/patients"),
      ])
      if (invoicesRes.data.success && invoicesRes.data.data) setInvoices(invoicesRes.data.data)
      if (patientsRes.data.success && patientsRes.data.data) setPatients(patientsRes.data.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load billing metrics.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    let result = invoices
    if (statusFilter !== "all") {
      result = result.filter(i => i.status === Number(statusFilter))
    }
    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter(i =>
        i.patientName.toLowerCase().includes(query) ||
        i.invoiceNumber.toLowerCase().includes(query) ||
        i.patientNumber.toLowerCase().includes(query)
      )
    }
    setFiltered(result)
  }, [search, statusFilter, invoices])

  const handleOpenCreateInvoice = () => {
    setSelectedPatientId(patients[0]?.id || "")
    setDiscountAmount(0)
    setTaxAmount(0)
    setInvoiceNotes("")
    setItemsList([{ description: "General Consultation Fee", quantity: 1, unitPrice: 50 }])
    setIsInvoiceModalOpen(true)
  }

  const handleAddItemRow = () => {
    setItemsList([...itemsList, { description: "", quantity: 1, unitPrice: 0 }])
  }

  const handleRemoveItemRow = (idx: number) => {
    setItemsList(itemsList.filter((_, i) => i !== idx))
  }

  const handleItemChange = (idx: number, field: keyof typeof itemsList[0], value: any) => {
    const updated = [...itemsList]
    updated[idx] = { ...updated[idx], [field]: value }
    setItemsList(updated)
  }

  const handleCreateInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatientId || itemsList.some(i => !i.description || i.unitPrice <= 0)) {
      toast.warn("Please complete all invoice line items with positive pricing.")
      return
    }
    try {
      const res = await apiClient.post<ApiResponse<InvoiceDto>>("/billing/invoices", {
        patientId: selectedPatientId,
        discountAmount,
        taxAmount,
        notes: invoiceNotes,
        items: itemsList,
      })
      if (res.data.success) {
        toast.success("Invoice generated successfully.")
        loadData()
        setIsInvoiceModalOpen(false)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to issue invoice.")
    }
  }

  const handleOpenPayment = (inv: InvoiceDto) => {
    setActiveInvoice(inv)
    setPaymentAmount(inv.dueAmount)
    setPaymentMethod(1)
    setTransactionId("")
    setPaymentNotes("")
    setIsPaymentModalOpen(true)
  }

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeInvoice || paymentAmount <= 0) return
    try {
      const res = await apiClient.post<ApiResponse<InvoiceDto>>(`/billing/invoices/${activeInvoice.id}/payments`, {
        amount: paymentAmount,
        paymentMethod,
        transactionId: transactionId || null,
        notes: paymentNotes,
      })
      if (res.data.success) {
        toast.success("Payment recorded successfully.")
        loadData()
        setIsPaymentModalOpen(false)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to record payment.")
    }
  }

  const handleOpenViewDetails = (inv: InvoiceDto) => {
    setViewInvoice(inv)
    setIsViewModalOpen(true)
  }

  const calculateSubtotal = () => itemsList.reduce((acc, val) => acc + (val.quantity * val.unitPrice), 0)
  const calculateFinalTotal = () => calculateSubtotal() - discountAmount + taxAmount

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-primary" />
            Billing & Invoicing
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Generate invoices, track ledger payments, and review outstanding accounts</p>
        </div>
        <Button onClick={handleOpenCreateInvoice} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Issue Invoice
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Search by invoice number or patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          {["all", "1", "2", "3", "4"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all whitespace-nowrap ${
                statusFilter === status
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-input text-foreground hover:bg-secondary"
              }`}
            >
              {status === "all" ? "All Statuses" : PAYMENT_STATUS_LABELS[Number(status)]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Total Bill</TableHead>
                <TableHead>Due Amount</TableHead>
                <TableHead>Date Issued</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No invoices generated.</TableCell></TableRow>
              ) : filtered.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono text-sm font-semibold">{i.invoiceNumber}</TableCell>
                  <TableCell>
                    <div className="font-semibold">{i.patientName}</div>
                    <div className="text-xs text-muted-foreground">{i.patientNumber}</div>
                  </TableCell>
                  <TableCell className="font-semibold">${Number(i.totalAmount).toFixed(2)}</TableCell>
                  <TableCell className="text-destructive font-semibold">${Number(i.dueAmount).toFixed(2)}</TableCell>
                  <TableCell>{new Date(i.invoiceDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${PAYMENT_STATUS_CLASSES[i.status]}`}>
                      {PAYMENT_STATUS_LABELS[i.status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenViewDetails(i)} title="View Invoice">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {i.status !== 3 && (
                        <Button size="sm" onClick={() => handleOpenPayment(i)} className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" /> Pay
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}

      {/* Create Invoice Modal */}
      <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Issue Patient Invoice" description="Specify patients and add treatment line items to build a bill." size="lg">
        <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground/80">Select Patient</label>
            <select className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} required>
              {patients.map(p => <option key={p.id} value={p.id}>{p.patientName} ({p.patientNumber})</option>)}
            </select>
          </div>

          <div className="border-t border-border/50 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">Billing Line Items</span>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItemRow}>+ Add Item</Button>
            </div>
            
            {itemsList.map((itm, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 items-end bg-muted/20 p-2.5 rounded-lg border border-border/40">
                <div className="col-span-6">
                  <Input label="Description" placeholder="Consultation, treatment, scan..." value={itm.description} onChange={(e) => handleItemChange(idx, "description", e.target.value)} required />
                </div>
                <div className="col-span-2">
                  <Input label="Qty" type="number" min={1} value={itm.quantity} onChange={(e) => handleItemChange(idx, "quantity", Number(e.target.value))} required />
                </div>
                <div className="col-span-3">
                  <Input label="Unit Price" type="number" min={0} value={itm.unitPrice} onChange={(e) => handleItemChange(idx, "unitPrice", Number(e.target.value))} required />
                </div>
                <div className="col-span-1 pb-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItemRow(idx)} disabled={itemsList.length === 1}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
            <Input label="Discount ($)" type="number" min={0} value={discountAmount} onChange={(e) => setDiscountAmount(Number(e.target.value))} />
            <Input label="Tax ($)" type="number" min={0} value={taxAmount} onChange={(e) => setTaxAmount(Number(e.target.value))} />
          </div>

          <Input label="Ledger / Internal Notes" placeholder="Clinical notes, payment agreements..." value={invoiceNotes} onChange={(e) => setInvoiceNotes(e.target.value)} />

          <div className="bg-muted/40 p-4 rounded-xl flex items-center justify-between font-semibold border border-border/50">
            <span className="text-sm text-muted-foreground">Invoice Summary</span>
            <span className="text-lg text-foreground">Total: ${calculateFinalTotal().toFixed(2)}</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsInvoiceModalOpen(false)}>Cancel</Button>
            <Button type="submit">Issue Invoice</Button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Ledger Payment" description="Apply cash, card or insurance check payments.">
        <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
          {activeInvoice && (
            <div className="bg-muted/40 p-3 rounded-lg border border-border/50 text-sm space-y-1">
              <div>Invoice: <span className="font-semibold">{activeInvoice.invoiceNumber}</span></div>
              <div>Patient: <span className="font-semibold">{activeInvoice.patientName}</span></div>
              <div>Outstanding Balance: <span className="font-semibold text-destructive">${Number(activeInvoice.dueAmount).toFixed(2)}</span></div>
            </div>
          )}
          <Input label="Payment Amount ($)" type="number" min={0.01} step={0.01} value={paymentAmount} onChange={(e) => setPaymentAmount(Number(e.target.value))} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground/80">Payment Method</label>
            <select className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2" value={paymentMethod} onChange={(e) => setPaymentMethod(Number(e.target.value))}>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <Input label="Transaction ID / Check Number" placeholder="Optional identifier reference..." value={transactionId} onChange={(e) => setTransactionId(e.target.value)} />
          <Input label="Remarks" placeholder="Note on insurance approval, bank transfer status..." value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} />

          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
            <Button type="submit">Post Payment</Button>
          </div>
        </form>
      </Modal>

      {/* View Details / Invoice Bill Preview Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Invoice Details" description="View billing lines, payments ledger and print copy." size="lg">
        {viewInvoice && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div>
                <h3 className="text-xl font-bold font-mono text-primary">{viewInvoice.invoiceNumber}</h3>
                <p className="text-xs text-muted-foreground">Issued: {new Date(viewInvoice.invoiceDate).toLocaleString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${PAYMENT_STATUS_CLASSES[viewInvoice.status]}`}>
                {PAYMENT_STATUS_LABELS[viewInvoice.status]}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-muted-foreground uppercase block font-semibold">Billed To</span>
                <span className="font-bold text-foreground block">{viewInvoice.patientName}</span>
                <span className="text-xs text-muted-foreground font-mono">{viewInvoice.patientNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground uppercase block font-semibold">Ledger Info</span>
                <span className="text-xs text-foreground block">Agent: {viewInvoice.generatedBy || "Billing"}</span>
                {viewInvoice.notes && <span className="text-xs italic block text-muted-foreground">"{viewInvoice.notes}"</span>}
              </div>
            </div>

            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold block mb-2">Itemized Invoice Details</span>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Line Description</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {viewInvoice.items.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell className="font-medium">{it.description}</TableCell>
                      <TableCell className="text-center">{it.quantity}</TableCell>
                      <TableCell className="text-right">${Number(it.unitPrice).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">${Number(it.amount).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-semibold text-muted-foreground">Discount Applied:</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">-${Number(viewInvoice.discountAmount).toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-semibold text-muted-foreground">Tax Surcharge:</TableCell>
                    <TableCell className="text-right font-semibold text-foreground">+${Number(viewInvoice.taxAmount).toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/40 font-bold">
                    <TableCell colSpan={3} className="text-right text-base text-foreground">Total Bill Balance:</TableCell>
                    <TableCell className="text-right text-base text-primary">${(Number(viewInvoice.totalAmount) - Number(viewInvoice.discountAmount) + Number(viewInvoice.taxAmount)).toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-semibold text-green-600">Total Payments Posted:</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">${Number(viewInvoice.paidAmount).toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow className="border-t-2 border-border/80">
                    <TableCell colSpan={3} className="text-right font-bold text-destructive">Remaining Due Amount:</TableCell>
                    <TableCell className="text-right font-bold text-destructive">${Number(viewInvoice.dueAmount).toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {viewInvoice.payments.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold block mb-2">Transaction History</span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {viewInvoice.payments.map((p) => (
                    <div key={p.id} className="flex justify-between items-center text-xs p-2 bg-secondary/30 rounded border border-border/50">
                      <div>
                        <span className="font-semibold text-foreground">${Number(p.amount).toFixed(2)}</span> via {PAYMENT_METHOD_LABELS[p.paymentMethod]}
                        {p.transactionId && <span className="font-mono text-muted-foreground ml-2">({p.transactionId})</span>}
                      </div>
                      <div className="text-muted-foreground">{new Date(p.paidAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-border/50">
              <Button onClick={() => setIsViewModalOpen(false)}>Close Details</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
