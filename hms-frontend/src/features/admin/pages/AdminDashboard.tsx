import React, { useEffect, useState } from "react"
import { Users, Calendar, CreditCard, BedDouble, TrendingUp, Activity, UserCheck, AlertCircle, RefreshCw, BarChart3, PieChart as PieIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import apiClient from "@/api/client"
import type { ApiResponse } from "@/types"

interface ChartDataPoint {
  label: string
  value: number
}

interface RecentActivity {
  description: string
  type: string
  timestamp: string
  userName?: string
}

interface DashboardStats {
  totalPatients: number
  totalDoctors: number
  totalAppointments: number
  todayAppointments: number
  activeAdmissions: number
  availableBeds: number
  totalRevenue: number
  monthlyRevenue: number
  pendingBills: number
  newPatientsThisMonth: number
  monthlyRevenueChart: ChartDataPoint[]
  patientGrowthChart: ChartDataPoint[]
  appointmentsByDepartment: ChartDataPoint[]
  recentActivities: RecentActivity[]
}

interface StatCardProps {
  title: string
  value: string | number
  change: string
  icon: React.ReactNode
  color: string
  bgColor: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color, bgColor }) => (
  <Card className="hover:shadow-lg transition-all duration-300 border border-border/80">
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold text-foreground tracking-tight">{value}</p>
          <p className="text-xs font-medium text-muted-foreground mt-2">{change}</p>
        </div>
        <div className={`p-3.5 rounded-xl ${bgColor} ${color} shadow-sm shadow-black/5`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
)

const COLORS = ["var(--color-primary, #3b82f6)", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#14b8a6"]

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadStats = async () => {
    setIsLoading(true)
    try {
      const res = await apiClient.get<ApiResponse<DashboardStats>>("/dashboard/stats")
      if (res.data.success && res.data.data) {
        setStats(res.data.data)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load dashboard insights.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadStats() }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen -mt-20">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          <p className="text-sm font-semibold text-muted-foreground">Aggregating hospital analytics...</p>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-primary animate-pulse" />
            MediCare Analytics Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time stats, medical trends, and financial overview</p>
        </div>
        <button
          onClick={loadStats}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Primary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients.toLocaleString()}
          change={`+${stats.newPatientsThisMonth} new this month`}
          icon={<Users className="w-5 h-5" />}
          color="text-blue-500"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          change="Queue active"
          icon={<Calendar className="w-5 h-5" />}
          color="text-green-500"
          bgColor="bg-green-500/10"
        />
        <StatCard
          title="Active Admissions"
          value={stats.activeAdmissions}
          change={`${stats.availableBeds} beds available`}
          icon={<BedDouble className="w-5 h-5" />}
          color="text-purple-500"
          bgColor="bg-purple-500/10"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${Number(stats.monthlyRevenue).toLocaleString()}`}
          change={`Total: $${Number(stats.totalRevenue).toLocaleString()}`}
          icon={<CreditCard className="w-5 h-5" />}
          color="text-orange-500"
          bgColor="bg-orange-500/10"
        />
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Medical Staff</span>
            <span className="text-2xl font-bold text-foreground mt-1">{stats.totalDoctors} Active Doctors</span>
          </div>
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary"><UserCheck className="w-5 h-5" /></div>
        </div>
        <div className="bg-card border border-border/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">OPD Queue</span>
            <span className="text-2xl font-bold text-foreground mt-1">{stats.todayAppointments} Tokens Issued</span>
          </div>
          <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-500"><Activity className="w-5 h-5" /></div>
        </div>
        <div className="bg-card border border-border/80 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Ledger Overdues</span>
            <span className="text-2xl font-bold text-foreground mt-1">{stats.pendingBills} Pending Bills</span>
          </div>
          <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive"><AlertCircle className="w-5 h-5" /></div>
        </div>
      </div>

      {/* Analytics Charts & Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" /> Monthly Revenue Trends ($)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyRevenueChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--color-primary, #3b82f6)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} contentStyle={{ background: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px", color: "#fff" }} />
                  <Area type="monotone" dataKey="value" stroke="var(--color-primary, #3b82f6)" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Appointments by Department */}
        <Card className="border border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <PieIcon className="w-5 h-5 text-primary" /> Department Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.appointmentsByDepartment}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="label"
                  >
                    {stats.appointmentsByDepartment.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px", color: "#fff" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2">
              {stats.appointmentsByDepartment.map((item, idx) => (
                <div key={item.label} className="flex items-center gap-1.5 text-xs font-semibold">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-muted-foreground">{item.label} ({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Growth chart */}
        <Card className="lg:col-span-2 border border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <BarChart3 className="w-5 h-5 text-primary" /> Patient Volume Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.patientGrowthChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [value, "Total Patients"]} contentStyle={{ background: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px", color: "#fff" }} />
                  <Bar dataKey="value" fill="var(--color-primary, #3b82f6)" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card className="border border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">Live Audit Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivities.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 bg-primary`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-tight truncate">{item.description}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      By {item.userName || "System"} — {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
