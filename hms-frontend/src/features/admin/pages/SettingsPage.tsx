import React, { useEffect, useState } from "react"
import { Settings, Save, RefreshCw, Hospital, Phone, Mail, MapPin, DollarSign, Clock } from "lucide-react"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import apiClient from "@/api/client"
import type { ApiResponse } from "@/types"

interface HospitalSettings {
  hospitalName: string
  contactEmail: string
  contactPhone: string
  address: string
  currencySymbol: string
  defaultConsultationFee: string
}

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<HospitalSettings>({
    hospitalName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    currencySymbol: "$",
    defaultConsultationFee: "50",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const res = await apiClient.get<ApiResponse<HospitalSettings>>("/settings")
      if (res.data.success && res.data.data) {
        setSettings(res.data.data)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load hospital settings.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await apiClient.put<ApiResponse<HospitalSettings>>("/settings", settings)
      if (res.data.success && res.data.data) {
        toast.success("Settings updated successfully.")
        setSettings(res.data.data)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary" />
          System Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Configure global hospital parameters, contact credentials, and default billings</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card rounded-xl border border-border/80 shadow-sm p-6"
        >
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
                <Hospital className="w-5 h-5 text-primary" /> Clinic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Hospital Name"
                  value={settings.hospitalName}
                  onChange={(e) => setSettings({ ...settings, hospitalName: e.target.value })}
                  required
                />
                <Input
                  label="Contact Email"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Contact Phone Number"
                  value={settings.contactPhone}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                  required
                />
                <Input
                  label="Hospital Physical Address"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/50 pb-2">
                <DollarSign className="w-5 h-5 text-primary" /> Billing & Finance defaults
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-foreground/80">Currency Symbol</label>
                  <select
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-base focus-visible:outline-none"
                    value={settings.currencySymbol}
                    onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                  >
                    <option value="$">USD ($)</option>
                    <option value="€">EUR (€)</option>
                    <option value="£">GBP (£)</option>
                    <option value="¥">JPY (¥)</option>
                    <option value="₹">INR (₹)</option>
                  </select>
                </div>
                <Input
                  label="Default Appointment Consultation Fee"
                  type="number"
                  min={0}
                  value={settings.defaultConsultationFee}
                  onChange={(e) => setSettings({ ...settings, defaultConsultationFee: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/50 pt-6">
              <Button type="button" variant="outline" onClick={fetchSettings} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Reset Settings
              </Button>
              <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
                <Save className="w-4 h-4" /> {isSaving ? "Saving Settings..." : "Save Configuration"}
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  )
}
