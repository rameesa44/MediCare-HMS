import React, { useEffect, useState } from "react"
import { Calendar, Plus, Edit2, CheckCircle, XCircle, Search, Clock, FileText } from "lucide-react"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import apiClient from "@/api/client"
import type { ApiResponse } from "@/types"

interface AppointmentDto {
  id: string
  patientId: string
  patientName: string
  patientNumber: string
  doctorId: string
  doctorName: string
  departmentId: string
  departmentName: string
  appointmentDate: string
  timeSlot: string
  tokenNumber: number
  status: number // 1 = Scheduled, 2 = Completed, 3 = Cancelled, 4 = NoShow
  type: number
  symptoms?: string
  notes?: string
  cancellationReason?: string
}

interface PatientDto { id: string; patientName: string; patientNumber: string }
interface DoctorDto { id: string; doctorName: string; departmentId: string }
interface DepartmentDto { id: string; name: string }

const STATUS_LABELS: Record<number, string> = {
  1: "Scheduled",
  2: "Completed",
  3: "Cancelled",
  4: "No Show",
}

const STATUS_CLASSES: Record<number, string> = {
  1: "bg-blue-500/10 text-blue-500",
  2: "bg-green-500/10 text-green-500",
  3: "bg-destructive/10 text-destructive",
  4: "bg-yellow-500/10 text-yellow-500",
}

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([])
  const [patients, setPatients] = useState<PatientDto[]>([])
  const [doctors, setDoctors] = useState<DoctorDto[]>([])
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [filtered, setFiltered] = useState<AppointmentDto[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  // Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [selectedDeptId, setSelectedDeptId] = useState("")
  const [selectedDoctorId, setSelectedDoctorId] = useState("")
  const [appointmentDate, setAppointmentDate] = useState("")
  const [timeSlot, setTimeSlot] = useState("09:00")
  const [symptoms, setSymptoms] = useState("")
  const [notes, setNotes] = useState("")

  // Edit/Action Modal State
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDto | null>(null)
  const [editStatus, setEditStatus] = useState(1)
  const [editNotes, setEditNotes] = useState("")
  const [cancellationReason, setCancellationReason] = useState("")

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [apptsRes, patientsRes, doctorsRes, deptsRes] = await Promise.all([
        apiClient.get<ApiResponse<AppointmentDto[]>>("/appointments"),
        apiClient.get<ApiResponse<PatientDto[]>>("/patients"),
        apiClient.get<ApiResponse<DoctorDto[]>>("/doctors"),
        apiClient.get<ApiResponse<DepartmentDto[]>>("/departments"),
      ])
      if (apptsRes.data.success && apptsRes.data.data) setAppointments(apptsRes.data.data)
      if (patientsRes.data.success && patientsRes.data.data) setPatients(patientsRes.data.data)
      if (doctorsRes.data.success && doctorsRes.data.data) setDoctors(doctorsRes.data.data)
      if (deptsRes.data.success && deptsRes.data.data) setDepartments(deptsRes.data.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load appointment system data.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    let result = appointments
    if (statusFilter !== "all") {
      result = result.filter(a => a.status === Number(statusFilter))
    }
    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter(a =>
        a.patientName.toLowerCase().includes(query) ||
        a.doctorName.toLowerCase().includes(query) ||
        a.patientNumber.toLowerCase().includes(query)
      )
    }
    setFiltered(result)
  }, [search, statusFilter, appointments])

  // Filter doctors based on selected department in booking form
  const availableDoctors = doctors.filter(d => !selectedDeptId || d.departmentId === selectedDeptId)

  const handleOpenBook = () => {
    setSelectedPatientId(patients[0]?.id || "")
    setSelectedDeptId(departments[0]?.id || "")
    setSelectedDoctorId("")
    setAppointmentDate("")
    setTimeSlot("09:00")
    setSymptoms("")
    setNotes("")
    setIsBookModalOpen(true)
  }

  // Set default doctor when department changes
  useEffect(() => {
    if (selectedDeptId) {
      const filteredDocs = doctors.filter(d => d.departmentId === selectedDeptId)
      setSelectedDoctorId(filteredDocs[0]?.id || "")
    }
  }, [selectedDeptId, doctors])

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatientId || !selectedDeptId || !selectedDoctorId || !appointmentDate || !timeSlot) {
      toast.warn("Please specify patient, department, doctor, date, and slot.")
      return
    }
    try {
      const formattedSlot = timeSlot.length === 5 ? `${timeSlot}:00` : timeSlot
      const res = await apiClient.post<ApiResponse<AppointmentDto>>("/appointments", {
        patientId: selectedPatientId,
        doctorId: selectedDoctorId,
        departmentId: selectedDeptId,
        appointmentDate,
        timeSlot: formattedSlot,
        symptoms,
        notes,
      })
      if (res.data.success) {
        toast.success("Appointment booked successfully.")
        loadData()
        setIsBookModalOpen(false)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to book appointment.")
    }
  }

  const handleOpenAction = (appt: AppointmentDto) => {
    setSelectedAppointment(appt)
    setEditStatus(appt.status)
    setEditNotes(appt.notes || "")
    setCancellationReason(appt.cancellationReason || "")
    setIsActionModalOpen(true)
  }

  const handleSaveAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAppointment) return
    try {
      const res = await apiClient.put<ApiResponse<AppointmentDto>>(`/appointments/${selectedAppointment.id}`, {
        status: editStatus,
        notes: editNotes,
        cancellationReason: editStatus === 3 ? cancellationReason : null,
      })
      if (res.data.success) {
        toast.success("Appointment updated.")
        loadData()
        setIsActionModalOpen(false)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update appointment.")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Calendar className="w-7 h-7 text-primary" />
            Appointments
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage consultation queue, checkups and scheduling</p>
        </div>
        <Button onClick={handleOpenBook} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Book Appointment
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Search patients, doctors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {["all", "1", "2", "3", "4"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                statusFilter === status
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-input text-foreground hover:bg-secondary"
              }`}
            >
              {status === "all" ? "All" : STATUS_LABELS[Number(status)]}
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
                <TableHead>Token & Date</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor & Dept</TableHead>
                <TableHead>Slot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No appointments scheduled.</TableCell></TableRow>
              ) : filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="font-semibold text-primary">Token #{a.tokenNumber}</div>
                    <div className="text-xs text-muted-foreground">{new Date(a.appointmentDate).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{a.patientName}</div>
                    <div className="text-xs text-muted-foreground">{a.patientNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{a.doctorName}</div>
                    <div className="text-xs text-muted-foreground">{a.departmentName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {a.timeSlot.substring(0, 5)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${STATUS_CLASSES[a.status] || "bg-muted"}`}>
                      {STATUS_LABELS[a.status] || "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenAction(a)} className="flex items-center gap-1.5 ml-auto">
                      <Edit2 className="w-3.5 h-3.5" /> Modify
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}

      {/* Book Appointment Modal */}
      <Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} title="Book New Appointment" description="Select patient and doctor to schedule a visit.">
        <form onSubmit={handleBook} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground/80">Select Patient</label>
            <select className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2" value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} required>
              {patients.map(p => <option key={p.id} value={p.id}>{p.patientName} ({p.patientNumber})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground/80">Department</label>
              <select className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2" value={selectedDeptId} onChange={(e) => setSelectedDeptId(e.target.value)} required>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground/80">Doctor</label>
              <select className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 focus-visible:outline-none" value={selectedDoctorId} onChange={(e) => setSelectedDoctorId(e.target.value)} required>
                {availableDoctors.length === 0 ? (
                  <option value="">No doctors available</option>
                ) : availableDoctors.map(d => <option key={d.id} value={d.id}>{d.doctorName}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} required />
            <Input label="Time Slot" type="time" value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} required />
          </div>
          <Input label="Symptoms" placeholder="Headache, fever, general checkup..." value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground/80">Notes</label>
            <textarea className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-20" placeholder="Internal remarks..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => setIsBookModalOpen(false)}>Cancel</Button>
            <Button type="submit">Confirm Booking</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Status Modal */}
      <Modal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} title="Update Appointment Status" description="Modify status, add medical notes or cancel booking.">
        <form onSubmit={handleSaveAction} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground/80">Appointment Status</label>
            <select className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 focus-visible:outline-none" value={editStatus} onChange={(e) => setEditStatus(Number(e.target.value))}>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          {editStatus === 3 && (
            <Input label="Reason for Cancellation" placeholder="Patient request, doctor unavailable..." value={cancellationReason} onChange={(e) => setCancellationReason(e.target.value)} required />
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground/80">Medical Remarks / Notes</label>
            <textarea className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-base focus-visible:outline-none min-h-24" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Enter medical summary or description..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => setIsActionModalOpen(false)}>Cancel</Button>
            <Button type="submit">Update Appointment</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
