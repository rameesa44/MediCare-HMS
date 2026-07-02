import React from "react"
import { Calendar, FileText, CreditCard, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { useAuth } from "@/hooks/useAuth"

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
          Welcome, {user?.firstName}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Your health portal — manage your appointments and records</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Upcoming Appointments", value: "2", icon: Calendar, color: "text-blue-600 bg-blue-100 dark:bg-blue-950" },
          { title: "Medical Records", value: "14", icon: FileText, color: "text-green-600 bg-green-100 dark:bg-green-950" },
          { title: "Pending Bills", value: "1", icon: CreditCard, color: "text-orange-600 bg-orange-100 dark:bg-orange-950" },
          { title: "Prescriptions", value: "3", icon: Activity, color: "text-purple-600 bg-purple-100 dark:bg-purple-950" },
        ].map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-extrabold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Upcoming Appointments</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center rounded-lg bg-muted/20 border border-dashed border-border">
              <p className="text-sm text-muted-foreground">Your appointments will appear here (Phase 3)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent Prescriptions</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center rounded-lg bg-muted/20 border border-dashed border-border">
              <p className="text-sm text-muted-foreground">Your prescriptions will appear here (Phase 3)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
