import React, { useEffect, useState } from "react"
import { Calendar, UserCheck, Activity, CreditCard, Clock, Plus, Search, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import apiClient from "@/api/client"
import type { ApiResponse } from "@/types"

interface AppointmentDto {
  id: string
  patientName: string
  patientNumber: string
  doctorName: string
  departmentName: string
  appointmentDate: string
  timeSlot: string
  tokenNumber: number
  status: number
}

interface PatientDto { id: string; patientName: string; patientNumber: string }
interface InvoiceDto { id: string; dueAmount: number; status: number }

const APPT_STATUS_LABELS: Record<number, string> = {
  1: "Scheduled",
  2: "Completed",
  3: "Cancelled",
  4: "No Show",
}

export const ReceptionDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([])
  const [patients, setPatients] = useState<PatientDto[]>([])
  const [invoices, setInvoices] = useState<InvoiceDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Registration Modal State
  const [isRegModalOpen, setIsRegModalOpen] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState(1)

  const loadReceptionData = async () => {
    setIsLoading(true)
    try {
      const [apptsRes, patientsRes, invoicesRes] = await Promise.all([
        apiClient.get<ApiResponse<AppointmentDto[]>>("/appointments"),
        apiClient.get<ApiResponse<PatientDto[]>>("/patients"),
        apiClient.get<ApiResponse<InvoiceDto[]>>("/billing/invoices"),
      ])
      if (apptsRes.data.success && apptsRes.data.data) setAppointments(apptsRes.data.data)
      if (patientsRes.data.success && patientsRes.data.data) setPatients(patientsRes.data.data)
      if (invoicesRes.data.success && invoicesRes.data.data) setInvoices(invoicesRes.data.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load reception metrics.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadReceptionData() }, [])

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !lastName || !email || !dob) {
      toast.warn("Please complete required fields.")
      return
    }
    try {
      const res = await apiClient.post<ApiResponse<any>>("/patients", {
        firstName, lastName, email, phoneNumber: phone,
        dateOfBirth: dob, gender,
      })
      if (res.data.success) {
        toast.success("Patient registered successfully.")
        loadReceptionData()
        setIsRegModalOpen(false)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to register patient.")
    }
  }

  const handleCallQueue = async (id: string, currentStatus: number) => {
    try {
      const nextStatus = currentStatus === 1 ? 2 : 1
      const res = await apiClient.put<ApiResponse<any>>(`/appointments/${id}`, {
        status: nextStatus,
      })
      if (res.data.success) {
        toast.success(nextStatus === 2 ? "Patient consultation marked completed." : "Appointment updated.")
        loadReceptionData()
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update queue token status.")
    }
  }

  // Stats
  const todayStr = new Date().toISOString().split("T")[0]
  const todayAppointments = appointments.filter(a => a.appointmentDate.startsWith(todayStr))
  
  const todayBookingsCount = todayAppointments.length
  const patientsCount = patients.length
  
  const activeQueueCount = todayAppointments.filter(a => a.status === 1).length
  const pendingPaymentsCount = invoices.filter(i => i.status === 1 || i.status === 2).length

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Reception Desk Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">OPD Queue management, walk-in registrations, and ledger overview</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => {
            setFirstName(""); setLastName(""); setEmail(""); setPhone("")
            setDob(""); setGender(1); setIsRegModalOpen(true)
          }} className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Register Walk-in
          </Button>
          <Button variant="outline" onClick={loadReceptionData} className="flex items-center gap-1.5">
            <Activity className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground font-semibold">Today's Bookings</p>
                    <p className="text-3xl font-extrabold mt-1">{todayBookingsCount}</p>
                    <p className="text-xs text-muted-foreground mt-2">Visits scheduled today</p>
                  </div>
                  <div className="p-3 rounded-xl text-blue-600 bg-blue-100 dark:bg-blue-950">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground font-semibold">Registered Patients</p>
                    <p className="text-3xl font-extrabold mt-1">{patientsCount}</p>
                    <p className="text-xs text-muted-foreground mt-2">Total active directory</p>
                  </div>
                  <div className="p-3 rounded-xl text-green-600 bg-green-100 dark:bg-green-950">
                    <UserCheck className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground font-semibold">Active Queue Tokens</p>
                    <p className="text-3xl font-extrabold mt-1">{activeQueueCount}</p>
                    <p className="text-xs text-muted-foreground mt-2">Waiting in OPD lobby</p>
                  </div>
                  <div className="p-3 rounded-xl text-orange-600 bg-orange-100 dark:bg-orange-950">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground font-semibold">Unpaid Bills</p>
                    <p className="text-3xl font-extrabold mt-1">{pendingPaymentsCount}</p>
                    <p className="text-xs text-muted-foreground mt-2">Awaiting transaction</p>
                  </div>
                  <div className="p-3 rounded-xl text-purple-600 bg-purple-100 dark:bg-purple-950">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Live OPD Queue Board</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token No</TableHead>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Assigned Practitioner</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayAppointments.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">No queue tokens active for today.</TableCell></TableRow>
                  ) : todayAppointments.map((appt) => (
                    <TableRow key={appt.id}>
                      <TableCell className="font-semibold text-primary">Token #{appt.tokenNumber}</TableCell>
                      <TableCell>
                        <div className="font-semibold">{appt.patientName}</div>
                        <div className="text-xs text-muted-foreground">{appt.patientNumber}</div>
                      </TableCell>
                      <TableCell>{appt.doctorName}</TableCell>
                      <TableCell>{appt.departmentName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          {appt.timeSlot.substring(0, 5)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${appt.status === 2 ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"}`}>
                          {APPT_STATUS_LABELS[appt.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {appt.status === 1 ? (
                          <Button size="sm" variant="outline" onClick={() => handleCallQueue(appt.id, appt.status)} className="flex items-center gap-1 ml-auto">
                            <CheckCircle className="w-3.5 h-3.5" /> Call / Complete
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Called / Visited</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Patient Walkin Registration Modal */}
      <Modal isOpen={isRegModalOpen} onClose={() => setIsRegModalOpen(false)} title="Register Walk-in Patient" description="Register basic demographics to create a patient profile.">
        <form onSubmit={handleRegisterPatient} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date of Birth" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground/80">Gender</label>
              <select className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2" value={gender} onChange={(e) => setGender(Number(e.target.value))}>
                <option value={1}>Male</option>
                <option value={2}>Female</option>
                <option value={3}>Other</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => setIsRegModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Patient Profile</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
