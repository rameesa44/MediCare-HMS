import React, { useEffect, useState } from "react"
import { BedDouble, Plus, Edit2, ShieldCheck, ShieldAlert, ArrowUpRight, LogOut, FileText, CheckCircle, Search } from "lucide-react"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import apiClient from "@/api/client"
import type { ApiResponse } from "@/types"

interface BedDto {
  id: string
  wardId: string
  wardName: string
  bedNumber: string
  status: number // 1 = Available, 2 = Occupied, 3 = Maintenance, 4 = Reserved
}

interface WardDto {
  id: string
  name: string
  type?: string
  totalBeds: number
  floorNumber: number
  isActive: boolean
  description?: string
  availableBeds: number
  beds: BedDto[]
}

interface AdmissionDto {
  id: string
  patientId: string
  patientName: string
  patientNumber: string
  wardId: string
  wardName: string
  bedId: string
  bedNumber: string
  admittedAt: string
  dischargedAt?: string
  status: number // 1 = Active, 2 = Discharged
  reasonForAdmission?: string
  dischargeSummary?: string
}

interface PatientDto { id: string; patientName: string; patientNumber: string }

const BED_STATUS_LABELS: Record<number, string> = {
  1: "Available",
  2: "Occupied",
  3: "Maintenance",
  4: "Reserved",
}

const BED_STATUS_CLASSES: Record<number, string> = {
  1: "bg-green-500/10 text-green-500",
  2: "bg-blue-500/10 text-blue-500",
  3: "bg-destructive/10 text-destructive",
  4: "bg-yellow-500/10 text-yellow-500",
}

export const WardsPage: React.FC = () => {
  const [wards, setWards] = useState<WardDto[]>([])
  const [admissions, setAdmissions] = useState<AdmissionDto[]>([])
  const [patients, setPatients] = useState<PatientDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"wards" | "admissions">("wards")

  // Create Ward States
  const [isWardModalOpen, setIsWardModalOpen] = useState(false)
  const [wardName, setWardName] = useState("")
  const [wardType, setWardType] = useState("General")
  const [floorNumber, setFloorNumber] = useState(1)
  const [wardDesc, setWardDesc] = useState("")

  // Create Bed States
  const [isBedModalOpen, setIsBedModalOpen] = useState(false)
  const [selectedWardId, setSelectedWardId] = useState("")
  const [bedNumber, setBedNumber] = useState("")

  // Admission States
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false)
  const [admitPatientId, setAdmitPatientId] = useState("")
  const [admitWardId, setAdmitWardId] = useState("")
  const [admitBedId, setAdmitBedId] = useState("")
  const [admitReason, setAdmitReason] = useState("")

  // Discharge States
  const [isDischargeModalOpen, setIsDischargeModalOpen] = useState(false)
  const [dischargeAdmissionId, setDischargeAdmissionId] = useState("")
  const [dischargeSummary, setDischargeSummary] = useState("")

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [wardsRes, admissionsRes, patientsRes] = await Promise.all([
        apiClient.get<ApiResponse<WardDto[]>>("/wards"),
        apiClient.get<ApiResponse<AdmissionDto[]>>("/wards/admissions"),
        apiClient.get<ApiResponse<PatientDto[]>>("/patients"),
      ])
      if (wardsRes.data.success && wardsRes.data.data) setWards(wardsRes.data.data)
      if (admissionsRes.data.success && admissionsRes.data.data) setAdmissions(admissionsRes.data.data)
      if (patientsRes.data.success && patientsRes.data.data) setPatients(patientsRes.data.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load ward details.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // Auto select a bed when admission ward changes
  useEffect(() => {
    if (admitWardId) {
      const ward = wards.find(w => w.id === admitWardId)
      const firstAvailableBed = ward?.beds.find(b => b.status === 1)
      setAdmitBedId(firstAvailableBed?.id || "")
    }
  }, [admitWardId, wards])

  const handleCreateWard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wardName) return
    try {
      const res = await apiClient.post<ApiResponse<WardDto>>("/wards", {
        name: wardName,
        type: wardType,
        floorNumber,
        description: wardDesc,
      })
      if (res.data.success) {
        toast.success("Ward created successfully.")
        loadData()
        setIsWardModalOpen(false)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create ward.")
    }
  }

  const handleAddBed = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWardId || !bedNumber) return
    try {
      const res = await apiClient.post<ApiResponse<BedDto>>(`/wards/${selectedWardId}/beds`, {
        bedNumber,
      })
      if (res.data.success) {
        toast.success("Bed added successfully.")
        loadData()
        setIsBedModalOpen(false)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add bed.")
    }
  }

  const handleAdmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admitPatientId || !admitWardId || !admitBedId) {
      toast.warn("Please select patient, ward and an available bed.")
      return
    }
    try {
      const res = await apiClient.post<ApiResponse<AdmissionDto>>("/wards/admissions", {
        patientId: admitPatientId,
        wardId: admitWardId,
        bedId: admitBedId,
        reasonForAdmission: admitReason,
      })
      if (res.data.success) {
        toast.success("Patient admitted successfully.")
        loadData()
        setIsAdmitModalOpen(false)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to admit patient.")
    }
  }

  const handleDischarge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dischargeAdmissionId) return
    try {
      const res = await apiClient.put<ApiResponse<AdmissionDto>>(`/wards/admissions/${dischargeAdmissionId}/discharge`, {
        dischargeSummary,
      })
      if (res.data.success) {
        toast.success("Patient discharged successfully.")
        loadData()
        setIsDischargeModalOpen(false)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to discharge patient.")
    }
  }

  const changeBedStatus = async (bedId: string, status: number) => {
    try {
      const res = await apiClient.put<ApiResponse<BedDto>>(`/wards/beds/${bedId}/status?status=${status}`)
      if (res.data.success) {
        toast.success("Bed status updated.")
        loadData()
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update bed status.")
    }
  }

  const activeAdmissions = admissions.filter(a => a.status === 1)
  const pastAdmissions = admissions.filter(a => a.status === 2)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <BedDouble className="w-7 h-7 text-primary" />
            Wards & Beds
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage physical hospital layout, bed occupancy, and patient admissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setSelectedWardId(wards[0]?.id || ""); setBedNumber(""); setIsBedModalOpen(true) }} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Bed
          </Button>
          <Button onClick={() => { setWardName(""); setWardType("General"); setFloorNumber(1); setWardDesc(""); setIsWardModalOpen(true) }} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Ward
          </Button>
        </div>
      </div>

      <div className="border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("wards")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "wards"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Wards & Beds Layout
          </button>
          <button
            onClick={() => setActiveTab("admissions")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "admissions"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Admissions Registry
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : activeTab === "wards" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {wards.map((w) => (
            <motion.div
              key={w.id}
              className="bg-card rounded-xl border border-border p-5 space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    {w.name}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">{w.type}</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">Floor {w.floorNumber} — {w.description || "No description"}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-foreground">{w.availableBeds} / {w.totalBeds} Available</span>
                  <div className="w-24 bg-muted h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-primary h-full"
                      style={{ width: `${w.totalBeds > 0 ? (w.availableBeds / w.totalBeds) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2">
                {w.beds.map((b) => (
                  <div
                    key={b.id}
                    className="p-2 border border-border/80 rounded-lg flex flex-col items-center justify-center gap-1 group relative bg-secondary/30"
                  >
                    <BedDouble className={`w-6 h-6 ${b.status === 1 ? "text-green-500" : b.status === 2 ? "text-blue-500" : "text-muted-foreground"}`} />
                    <span className="text-xs font-semibold">{b.bedNumber}</span>
                    <span className={`text-[10px] font-medium px-1 rounded ${BED_STATUS_CLASSES[b.status] || "bg-muted"}`}>
                      {BED_STATUS_LABELS[b.status]}
                    </span>
                    <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 rounded-lg">
                      <button onClick={() => changeBedStatus(b.id, 1)} className="p-1 text-[10px] font-bold text-green-500 hover:bg-green-500/10 rounded">Free</button>
                      <button onClick={() => changeBedStatus(b.id, 3)} className="p-1 text-[10px] font-bold text-destructive hover:bg-destructive/10 rounded">Maint</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Current Occupancy</h3>
            <Button onClick={() => { setAdmitPatientId(patients[0]?.id || ""); setAdmitWardId(wards[0]?.id || ""); setAdmitReason(""); setIsAdmitModalOpen(true) }} className="flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4" /> Admit Patient
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Admitted At</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeAdmissions.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No patients currently admitted.</TableCell></TableRow>
              ) : activeAdmissions.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="font-semibold">{a.patientName}</div>
                    <div className="text-xs text-muted-foreground">{a.patientNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{a.wardName}</div>
                    <div className="text-xs text-muted-foreground">Bed {a.bedNumber}</div>
                  </TableCell>
                  <TableCell>{new Date(a.admittedAt).toLocaleString()}</TableCell>
                  <TableCell className="max-w-xs truncate">{a.reasonForAdmission}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setDischargeAdmissionId(a.id); setDischargeSummary(""); setIsDischargeModalOpen(true) }}
                      className="flex items-center gap-1.5 ml-auto text-destructive border-destructive/20 hover:bg-destructive/10"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Discharge
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="pt-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Past Admissions Summary</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Discharge Summary</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastAdmissions.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No historical records found.</TableCell></TableRow>
                ) : pastAdmissions.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="font-semibold">{a.patientName}</div>
                      <div className="text-xs text-muted-foreground">{a.patientNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{a.wardName}</div>
                      <div className="text-xs text-muted-foreground">Bed {a.bedNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">Adm: {new Date(a.admittedAt).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">Dis: {a.dischargedAt ? new Date(a.dischargedAt).toLocaleDateString() : "—"}</div>
                    </TableCell>
                    <TableCell className="max-w-md text-xs italic">{a.dischargeSummary || "No details."}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Create Ward Modal */}
      <Modal isOpen={isWardModalOpen} onClose={() => setIsWardModalOpen(false)} title="Create New Ward" description="Add a new physical medical unit to the hospital database.">
        <form onSubmit={handleCreateWard} className="space-y-4">
          <Input label="Ward Name" placeholder="e.g. ICU Ward A" value={wardName} onChange={(e) => setWardName(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground/80">Ward Type</label>
              <select className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2" value={wardType} onChange={(e) => setWardType(e.target.value)}>
                <option value="General">General</option>
                <option value="ICU">ICU</option>
                <option value="Pediatric">Pediatric</option>
                <option value="Maternity">Maternity</option>
                <option value="Surgical">Surgical</option>
              </select>
            </div>
            <Input label="Floor Number" type="number" min={1} value={floorNumber} onChange={(e) => setFloorNumber(Number(e.target.value))} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground/80">Description</label>
            <textarea className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-base focus-visible:outline-none min-h-20" placeholder="Clinical purpose or instructions..." value={wardDesc} onChange={(e) => setWardDesc(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => setIsWardModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Ward</Button>
          </div>
        </form>
      </Modal>

      {/* Add Bed Modal */}
      <Modal isOpen={isBedModalOpen} onClose={() => setIsBedModalOpen(false)} title="Add Bed to Ward" description="Register a new bed code in an existing ward location.">
        <form onSubmit={handleAddBed} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground/80">Target Ward</label>
            <select className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2" value={selectedWardId} onChange={(e) => setSelectedWardId(e.target.value)} required>
              {wards.map(w => <option key={w.id} value={w.id}>{w.name} (Floor {w.floorNumber})</option>)}
            </select>
          </div>
          <Input label="Bed Label / Code" placeholder="e.g. Bed-101" value={bedNumber} onChange={(e) => setBedNumber(e.target.value)} required />
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => setIsBedModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add Bed</Button>
          </div>
        </form>
      </Modal>

      {/* Admit Patient Modal */}
      <Modal isOpen={isAdmitModalOpen} onClose={() => setIsAdmitModalOpen(false)} title="Admit Patient to Ward" description="Assign a patient to an available ward and bed.">
        <form onSubmit={handleAdmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground/80">Patient</label>
            <select className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2" value={admitPatientId} onChange={(e) => setAdmitPatientId(e.target.value)} required>
              {patients.map(p => <option key={p.id} value={p.id}>{p.patientName} ({p.patientNumber})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground/80">Ward</label>
              <select className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2" value={admitWardId} onChange={(e) => setAdmitWardId(e.target.value)} required>
                {wards.map(w => <option key={w.id} value={w.id}>{w.name} ({w.availableBeds} Free)</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground/80">Bed</label>
              <select className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2" value={admitBedId} onChange={(e) => setAdmitBedId(e.target.value)} required>
                {wards.find(w => w.id === admitWardId)?.beds.filter(b => b.status === 1).map(b => (
                  <option key={b.id} value={b.id}>{b.bedNumber}</option>
                )) || <option value="">No available beds</option>}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground/80">Reason for Admission</label>
            <textarea className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-base focus-visible:outline-none min-h-20" placeholder="Fever spikes, surgical recovery, overnight observation..." value={admitReason} onChange={(e) => setAdmitReason(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => setIsAdmitModalOpen(false)}>Cancel</Button>
            <Button type="submit">Admit Patient</Button>
          </div>
        </form>
      </Modal>

      {/* Discharge Patient Modal */}
      <Modal isOpen={isDischargeModalOpen} onClose={() => setIsDischargeModalOpen(false)} title="Confirm Patient Discharge" description="Provide summary and discharge notes to release patient from ward.">
        <form onSubmit={handleDischarge} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground/80">Discharge Summary / Clinical Instructions</label>
            <textarea className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-base focus-visible:outline-none min-h-24" placeholder="Medication guidelines, follow-up checkups scheduled, recovery guidelines..." value={dischargeSummary} onChange={(e) => setDischargeSummary(e.target.value)} required />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => setIsDischargeModalOpen(false)}>Cancel</Button>
            <Button type="submit">Complete Discharge</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
