import React, { useEffect, useState } from "react"
import { BedDouble, Users, Activity, ClipboardList, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import apiClient from "@/api/client"
import type { ApiResponse } from "@/types"

interface BedDto {
  id: string
  wardId: string
  bedNumber: string
  status: number // 1 = Available, 2 = Occupied, 3 = Maintenance, 4 = Reserved
}

interface WardDto {
  id: string
  name: string
  type?: string
  totalBeds: number
  availableBeds: number
  beds: BedDto[]
}

interface AdmissionDto {
  id: string
  status: number // 1 = Active, 2 = Discharged
}

const BED_STATUS_CLASSES: Record<number, string> = {
  1: "bg-green-500/10 border-green-500 text-green-500",
  2: "bg-blue-500/10 border-blue-500 text-blue-500",
  3: "bg-destructive/10 border-destructive text-destructive",
  4: "bg-yellow-500/10 border-yellow-500 text-yellow-500",
}

const BED_STATUS_LABELS: Record<number, string> = {
  1: "Available",
  2: "Occupied",
  3: "Maintenance",
  4: "Reserved",
}

export const WardDashboard: React.FC = () => {
  const [wards, setWards] = useState<WardDto[]>([])
  const [admissions, setAdmissions] = useState<AdmissionDto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadWardDashboardData = async () => {
    setIsLoading(true)
    try {
      const [wardsRes, admissionsRes] = await Promise.all([
        apiClient.get<ApiResponse<WardDto[]>>("/wards"),
        apiClient.get<ApiResponse<AdmissionDto[]>>("/wards/admissions"),
      ])
      if (wardsRes.data.success && wardsRes.data.data) setWards(wardsRes.data.data)
      if (admissionsRes.data.success && admissionsRes.data.data) setAdmissions(admissionsRes.data.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load ward metrics.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadWardDashboardData() }, [])

  // Bed status changer
  const toggleMaintenance = async (bedId: string, currentStatus: number) => {
    const nextStatus = currentStatus === 3 ? 1 : 3
    try {
      const res = await apiClient.put<ApiResponse<any>>(`/wards/beds/${bedId}/status?status=${nextStatus}`)
      if (res.data.success) {
        toast.success(nextStatus === 3 ? "Bed placed in maintenance." : "Bed marked available.")
        loadWardDashboardData()
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update bed status.")
    }
  }

  // Aggregate stats
  const totalBeds = wards.reduce((acc, w) => acc + w.totalBeds, 0)
  const availableBeds = wards.reduce((acc, w) => acc + w.availableBeds, 0)
  const occupiedBeds = totalBeds - availableBeds
  const activeAdmissions = admissions.filter(a => a.status === 1).length
  const maintenanceCount = wards.reduce((acc, w) => acc + w.beds.filter(b => b.status === 3).length, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Ward Desk Portal</h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time bed maps, maintenance checklists, and emergency admissions</p>
        </div>
        <Button variant="outline" onClick={loadWardDashboardData} className="flex items-center gap-1.5">
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
                    <p className="text-sm font-medium text-muted-foreground">Occupied Beds</p>
                    <p className="text-3xl font-extrabold mt-1">{occupiedBeds} / {totalBeds}</p>
                    <p className="text-xs text-muted-foreground mt-2">Physical hospital occupancy</p>
                  </div>
                  <div className="p-3 rounded-xl text-blue-600 bg-blue-100 dark:bg-blue-950">
                    <BedDouble className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Admissions</p>
                    <p className="text-3xl font-extrabold mt-1">{activeAdmissions}</p>
                    <p className="text-xs text-muted-foreground mt-2">Patients in clinical care</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Available Beds</p>
                    <p className="text-3xl font-extrabold mt-1">{availableBeds}</p>
                    <p className="text-xs text-muted-foreground mt-2">Ready for incoming patients</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Under Maintenance</p>
                    <p className="text-3xl font-extrabold mt-1">{maintenanceCount}</p>
                    <p className="text-xs text-muted-foreground mt-2">Beds undergoing sanitation</p>
                  </div>
                  <div className="p-3 rounded-xl text-purple-600 bg-purple-100 dark:bg-purple-950">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {wards.map((w) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border p-5 space-y-4"
              >
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center justify-between">
                    {w.name}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">{w.type || "General"}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{w.availableBeds} of {w.totalBeds} beds available</p>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {w.beds.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => b.status !== 2 && toggleMaintenance(b.id, b.status)}
                      disabled={b.status === 2}
                      className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center ${BED_STATUS_CLASSES[b.status] || "border-border hover:bg-secondary"} ${b.status === 2 ? "cursor-not-allowed opacity-90" : "hover:scale-[1.02]"}`}
                    >
                      <BedDouble className="w-5 h-5" />
                      <div>
                        <div className="text-xs font-bold text-foreground">{b.bedNumber}</div>
                        <div className="text-[9px] font-semibold mt-0.5 uppercase tracking-wide opacity-80">{BED_STATUS_LABELS[b.status]}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
