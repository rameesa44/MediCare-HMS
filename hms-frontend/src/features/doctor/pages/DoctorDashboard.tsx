import React, { useEffect, useState } from "react"
import { Calendar, Users, Activity, ClipboardList, Clock, CheckCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import apiClient from "@/api/client"
import type { ApiResponse } from "@/types"

interface DoctorDto {
  id: string
  userId: string
  doctorName: string
  specialization: string
}

interface AppointmentDto {
  id: string
  patientId: string
  patientName: string
  patientNumber: string
  doctorId: string
  appointmentDate: string
  timeSlot: string
  tokenNumber: number
  status: number
  notes?: string
}

interface AdmissionDto {
  id: string
  patientName: string
  wardName: string
  bedNumber: string
  status: number
  doctorId: string
}

const APPT_STATUS_LABELS: Record<number, string> = {
  1: "Scheduled",
  2: "Completed",
  3: "Cancelled",
  4: "No Show",
}

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth()
  const [doctorProfile, setDoctorProfile] = useState<DoctorDto | null>(null)
  const [appointments, setAppointments] = useState<AppointmentDto[]>([])
  const [admissions, setAdmissions] = useState<AdmissionDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Edit / Complete Consultation State
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false)
  const [activeAppt, setActiveAppt] = useState<AppointmentDto | null>(null)
  const [consultNotes, setConsultNotes] = useState("")

  const loadDoctorDashboard = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      // 1. Get doctors list and find profile
      const docsRes = await apiClient.get<ApiResponse<DoctorDto[]>>("/doctors")
      if (docsRes.data.success && docsRes.data.data) {
        const found = docsRes.data.data.find(d => d.userId === user.id)
        if (found) {
          setDoctorProfile(found)
          
          // 2. Fetch appointments and admissions for this doctor
          const [apptsRes, admissionsRes] = await Promise.all([
            apiClient.get<ApiResponse<AppointmentDto[]>>(`/appointments?doctorId=${found.id}`),
            apiClient.get<ApiResponse<AdmissionDto[]>>("/wards/admissions"),
          ])
          
          if (apptsRes.data.success && apptsRes.data.data) {
            setAppointments(apptsRes.data.data)
          }
          if (admissionsRes.data.success && admissionsRes.data.data) {
            setAdmissions(admissionsRes.data.data)
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load doctor dashboard stats.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadDoctorDashboard() }, [user])

  const handleOpenConsult = (appt: AppointmentDto) => {
    setActiveAppt(appt)
    setConsultNotes(appt.notes || "")
    setIsConsultModalOpen(true)
  }

  const handleSaveConsult = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeAppt) return
    try {
      const res = await apiClient.put<ApiResponse<AppointmentDto>>(`/appointments/${activeAppt.id}`, {
        status: 2, // Completed
        notes: consultNotes,
      })
      if (res.data.success) {
        toast.success("Consultation marked completed.")
        loadDoctorDashboard()
        setIsConsultModalOpen(false)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to complete consultation.")
    }
  }

  // Stats Calculations
  const todayStr = new Date().toISOString().split("T")[0]
  const todayAppointments = appointments.filter(a => a.appointmentDate.startsWith(todayStr))
  
  // Total Patients (unique patient IDs)
  const uniquePatients = new Set(appointments.map(a => a.patientId)).size
  
  // Pending Reports/Consults (Scheduled appointments in the past or today)
  const pendingConsults = appointments.filter(a => a.status === 1).length
  
  // My Ward Admissions (admissions where doctor matches)
  // Let's filter: admission status == Active (1) and matches doctor ID
  const myAdmissions = admissions.filter(ad => ad.status === 1)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
            Dr. {user?.lastName}'s Portal
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {doctorProfile ? `${doctorProfile.specialization} Department` : "Clinical practitioner portal"}
          </p>
        </div>
        <Button variant="outline" onClick={loadDoctorDashboard} className="flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
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
                    <p className="text-sm font-medium text-muted-foreground">Today's Queue</p>
                    <p className="text-3xl font-extrabold mt-1">{todayAppointments.length}</p>
                    <p className="text-xs text-muted-foreground mt-2">Appointments scheduled today</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Total Consulted</p>
                    <p className="text-3xl font-extrabold mt-1">{uniquePatients}</p>
                    <p className="text-xs text-muted-foreground mt-2">Unique patient profiles</p>
                  </div>
                  <div className="p-3 rounded-xl text-green-600 bg-green-100 dark:bg-green-950">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Consultations</p>
                    <p className="text-3xl font-extrabold mt-1">{pendingConsults}</p>
                    <p className="text-xs text-muted-foreground mt-2">Needs clinical remarks</p>
                  </div>
                  <div className="p-3 rounded-xl text-orange-600 bg-orange-100 dark:bg-orange-950">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ongoing Admissions</p>
                    <p className="text-3xl font-extrabold mt-1">{myAdmissions.length}</p>
                    <p className="text-xs text-muted-foreground mt-2">Patients in ward care</p>
                  </div>
                  <div className="p-3 rounded-xl text-purple-600 bg-purple-100 dark:bg-purple-950">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Today's Schedule & Consultations</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayAppointments.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">No appointments scheduled for today.</TableCell></TableRow>
                  ) : todayAppointments.map((appt) => (
                    <TableRow key={appt.id}>
                      <TableCell className="font-semibold text-primary">Token #{appt.tokenNumber}</TableCell>
                      <TableCell>
                        <div className="font-semibold">{appt.patientName}</div>
                        <div className="text-xs text-muted-foreground">{appt.patientNumber}</div>
                      </TableCell>
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
                          <Button size="sm" onClick={() => handleOpenConsult(appt)} className="flex items-center gap-1 ml-auto">
                            <CheckCircle className="w-3.5 h-3.5" /> Start Consult
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Completed</span>
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

      {/* Consult Modal */}
      <Modal isOpen={isConsultModalOpen} onClose={() => setIsConsultModalOpen(false)} title="Patient Clinical Consultation" description="Complete consultation notes and prescribe diagnosis.">
        <form onSubmit={handleSaveConsult} className="space-y-4">
          {activeAppt && (
            <div className="bg-muted/40 p-3 rounded-lg border border-border text-sm space-y-1">
              <div>Patient: <span className="font-semibold">{activeAppt.patientName}</span></div>
              <div>Token: <span className="font-semibold">#{activeAppt.tokenNumber}</span></div>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground/80">Diagnosis Summary & Prescription Notes</label>
            <textarea className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-base focus-visible:outline-none min-h-36" value={consultNotes} onChange={(e) => setConsultNotes(e.target.value)} placeholder="Enter details about diagnosis, prescribed medicines, and advice..." required />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => setIsConsultModalOpen(false)}>Cancel</Button>
            <Button type="submit">Complete Visit</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
