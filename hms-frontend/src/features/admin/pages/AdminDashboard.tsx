import React from "react"
import { Users, Calendar, CreditCard, BedDouble, TrendingUp, Activity, UserCheck, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

interface StatCardProps {
  title: string
  value: string | number
  change: string
  icon: React.ReactNode
  color: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-extrabold text-foreground mt-1">{value}</p>
          <p className={`text-xs font-medium mt-2 ${color}`}>{change}</p>
        </div>
        <div className={`p-3 rounded-xl ${color.includes("green") ? "bg-green-100 dark:bg-green-950 text-green-600" : color.includes("blue") ? "bg-blue-100 dark:bg-blue-950 text-blue-600" : color.includes("purple") ? "bg-purple-100 dark:bg-purple-950 text-purple-600" : "bg-orange-100 dark:bg-orange-950 text-orange-600"}`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
)

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Admin Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          MediCare Hospital — Overview & Insights
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value="2,847"
          change="↑ 12% from last month"
          icon={<Users className="w-6 h-6" />}
          color="text-blue-600"
        />
        <StatCard
          title="Today's Appointments"
          value="64"
          change="↑ 8 more than yesterday"
          icon={<Calendar className="w-6 h-6" />}
          color="text-green-600"
        />
        <StatCard
          title="Active Admissions"
          value="138"
          change="↑ 3 new today"
          icon={<BedDouble className="w-6 h-6" />}
          color="text-purple-600"
        />
        <StatCard
          title="Revenue This Month"
          value="$84,230"
          change="↑ 23% vs last month"
          icon={<CreditCard className="w-6 h-6" />}
          color="text-orange-600"
        />
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Doctors"
          value="47"
          change="2 on leave today"
          icon={<UserCheck className="w-6 h-6" />}
          color="text-blue-600"
        />
        <StatCard
          title="Staff Members"
          value="182"
          change="Full capacity"
          icon={<Users className="w-6 h-6" />}
          color="text-green-600"
        />
        <StatCard
          title="OPD Queue Tokens"
          value="23"
          change="Currently active"
          icon={<Activity className="w-6 h-6" />}
          color="text-orange-600"
        />
        <StatCard
          title="Pending Bills"
          value="19"
          change="Awaiting settlement"
          icon={<AlertCircle className="w-6 h-6" />}
          color="text-purple-600"
        />
      </div>

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Monthly Appointment Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center rounded-lg bg-muted/20 border border-dashed border-border">
              <p className="text-sm text-muted-foreground">Chart will render here (Phase 3)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { text: "Patient #P-002847 registered", time: "2 min ago", color: "bg-blue-500" },
                { text: "Appointment #APT-1023 confirmed", time: "15 min ago", color: "bg-green-500" },
                { text: "Invoice #INV-0093 paid ($250)", time: "32 min ago", color: "bg-purple-500" },
                { text: "Ward B Bed #12 assigned", time: "1hr ago", color: "bg-orange-500" },
                { text: "Dr. Ahmed updated schedule", time: "2hr ago", color: "bg-teal-500" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${item.color}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground leading-tight">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
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
