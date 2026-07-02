import React from "react"
import { Calendar, UserCheck, Activity, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

export const ReceptionDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Reception Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage patient registrations, appointments, and tokens</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Today's Bookings", value: "34", icon: Calendar, color: "text-blue-600 bg-blue-100 dark:bg-blue-950" },
          { title: "Patients Registered", value: "8", icon: UserCheck, color: "text-green-600 bg-green-100 dark:bg-green-950" },
          { title: "Active Queue Tokens", value: "15", icon: Activity, color: "text-orange-600 bg-orange-100 dark:bg-orange-950" },
          { title: "Pending Payments", value: "6", icon: CreditCard, color: "text-purple-600 bg-purple-100 dark:bg-purple-950" },
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

      <Card>
        <CardHeader><CardTitle>Live OPD Queue</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center rounded-lg bg-muted/20 border border-dashed border-border">
            <p className="text-sm text-muted-foreground">Live queue management will render here (Phase 3)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
