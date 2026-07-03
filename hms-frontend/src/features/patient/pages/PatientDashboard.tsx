import React, { useEffect, useState } from "react"
import { Calendar, FileText, CreditCard, Activity, Clock, Heart, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import apiClient from "@/api/client"
import type { ApiResponse } from "@/types"

interface PatientDto {
  id: string
  userId: string
  patientNumber: string
}

interface AppointmentDto {
  id: string
  patientId: string
  doctorName: string
  departmentName: string
  appointmentDate: string
  timeSlot: string
  tokenNumber: number
  status: number // 1 = Scheduled, 2 = Completed, 3 = Cancelled
  notes?: string
}

interface InvoiceDto {
  id: string
  invoiceNumber: string
  dueAmount: number
  status: number
}

const APPT_STATUS_LABELS: Record<number, string> = {
  1: "Scheduled",
  2: "Completed",
  3: "Cancelled",
  4: "No Show",
}

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth()
  const [patientProfile, setPatientProfile] = useState<PatientDto | null>(null)
  const [appointments, setAppointments] = useState<AppointmentDto[]>([])
  const [invoices, setInvoices] = useState<InvoiceDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadPatientDashboardData = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      // 1. Get patients and match by user ID
      const patientsRes = await apiClient.get<ApiResponse<PatientDto[]>>("/patients")
      if (patientsRes.data.success && patientsRes.data.data) {
        const matched = patientsRes.data.data.find(p => p.userId === user.id)
        if (matched) {
          setPatientProfile(matched)

          // 2. Fetch specific appointments and invoices for this patient
          const [apptsRes, invoicesRes] = await Promise.all([
            apiClient.get<ApiResponse<AppointmentDto[]>>(`/appointments?patientId=${matched.id}`),
            apiClient.get<ApiResponse<InvoiceDto[]>>(`/billing/invoices?patientId=${matched.id}`),
          ])

          if (apptsRes.data.success && apptsRes.data.data) setAppointments(apptsRes.data.data)
          if (invoicesRes.data.success && invoicesRes.data.data) setInvoices(invoicesRes.data.data)
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load patient portal records.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadPatientDashboardData() }, [user])

  // Stat calculations
  const upcomingAppts = appointments.filter(a => a.status === 1)
  const completedAppts = appointments.filter(a => a.status === 2)
  const pendingInvoices = invoices.filter(i => i.status === 1 || i.status === 2)
  const prescriptionsCount = completedAppts.filter(a => a.notes).length

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary/10" />
            Welcome, {user?.firstName}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {patientProfile ? `Patient ID: ${patientProfile.patientNumber}` : "Patient Health Portal"}
          </p>
        </div>
        <button
          onClick={loadPatientDashboardData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
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
                    <p className="text-sm font-medium text-muted-foreground font-semibold">Upcoming Visits</p>
                    <p className="text-3xl font-extrabold mt-1">{upcomingAppts.length}</p>
                    <p className="text-xs text-muted-foreground mt-2">Visits scheduled</p>
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
                    <p className="text-sm font-medium text-muted-foreground font-semibold">Medical Reports</p>
                    <p className="text-3xl font-extrabold mt-1">{completedAppts.length}</p>
                    <p className="text-xs text-muted-foreground mt-2">Completed visits</p>
                  </div>
                  <div className="p-3 rounded-xl text-green-600 bg-green-100 dark:bg-green-950">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground font-semibold">Outstanding Bills</p>
                    <p className="text-3xl font-extrabold mt-1">{pendingInvoices.length}</p>
                    <p className="text-xs text-muted-foreground mt-2">Awaiting settlement</p>
                  </div>
                  <div className="p-3 rounded-xl text-orange-600 bg-orange-100 dark:bg-orange-950">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground font-semibold">Prescriptions</p>
                    <p className="text-3xl font-extrabold mt-1">{prescriptionsCount}</p>
                    <p className="text-xs text-muted-foreground mt-2">Active prescriptions</p>
                  </div>
                  <div className="p-3 rounded-xl text-purple-600 bg-purple-100 dark:bg-purple-950">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>My Scheduled Visits</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor & Dept</TableHead>
                      <TableHead>Date / Time</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingAppts.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No upcoming visits booked.</TableCell></TableRow>
                    ) : upcomingAppts.map((appt) => (
                      <TableRow key={appt.id}>
                        <TableCell>
                          <div className="font-semibold">{appt.doctorName}</div>
                          <div className="text-xs text-muted-foreground">{appt.departmentName}</div>
                        </TableCell>
                        <TableCell>
                          <div>{new Date(appt.appointmentDate).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {appt.timeSlot.substring(0, 5)}</div>
                        </TableCell>
                        <TableCell className="font-semibold text-primary">Token #{appt.tokenNumber}</TableCell>
                        <TableCell>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-500">
                            Scheduled
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Clinical Reports & Prescriptions</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Visit Details</TableHead>
                      <TableHead>Doctor Advice / Prescription Summary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedAppts.length === 0 ? (
                      <TableRow><TableCell colSpan={2} className="text-center py-6 text-muted-foreground">No historical report records.</TableCell></TableRow>
                    ) : completedAppts.map((appt) => (
                      <TableRow key={appt.id}>
                        <TableCell className="align-top">
                          <div className="font-semibold">{appt.doctorName}</div>
                          <div className="text-xs text-muted-foreground">{appt.departmentName}</div>
                          <div className="text-xs text-muted-foreground mt-1">{new Date(appt.appointmentDate).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell className="text-sm italic text-foreground/80 whitespace-pre-line max-w-sm">
                          {appt.notes || "No diagnosis remarks details provided."}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
