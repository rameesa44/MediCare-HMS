import React, { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, Users, Search } from "lucide-react"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import apiClient from "@/api/client"
import type { ApiResponse } from "@/types"

interface PatientDto {
  id: string
  userId: string
  patientName: string
  email: string
  phone?: string
  patientNumber: string
  dateOfBirth: string
  gender: number
  bloodGroup?: number
  address?: string
  city?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
}

const GENDER_LABELS: Record<number, string> = { 1: "Male", 2: "Female", 3: "Other" }
const BLOOD_GROUP_LABELS: Record<number, string> = {
  1: "A+", 2: "A−", 3: "B+", 4: "B−", 5: "AB+", 6: "AB−", 7: "O+", 8: "O−"
}

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<PatientDto[]>([])
  const [filtered, setFiltered] = useState<PatientDto[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<PatientDto | null>(null)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState(1)
  const [bloodGroup, setBloodGroup] = useState<number | undefined>(undefined)
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [emergencyName, setEmergencyName] = useState("")
  const [emergencyPhone, setEmergencyPhone] = useState("")

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await apiClient.get<ApiResponse<PatientDto[]>>("/patients")
      if (res.data.success && res.data.data) {
        setPatients(res.data.data)
        setFiltered(res.data.data)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load patients.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(patients.filter(p =>
      p.patientName.toLowerCase().includes(q) ||
      p.patientNumber.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    ))
  }, [search, patients])

  const resetForm = () => {
    setFirstName(""); setLastName(""); setEmail(""); setPhone("")
    setDob(""); setGender(1); setBloodGroup(undefined)
    setAddress(""); setCity(""); setEmergencyName(""); setEmergencyPhone("")
  }

  const handleOpenCreate = () => {
    setEditingPatient(null); resetForm(); setIsModalOpen(true)
  }

  const handleOpenEdit = (p: PatientDto) => {
    setEditingPatient(p)
    const [f, ...l] = p.patientName.split(" ")
    setFirstName(f || ""); setLastName(l.join(" ") || "")
    setEmail(p.email); setPhone(p.phone || "")
    setDob(p.dateOfBirth?.slice(0, 10) || "")
    setGender(p.gender); setBloodGroup(p.bloodGroup)
    setAddress(p.address || ""); setCity(p.city || "")
    setEmergencyName(p.emergencyContactName || "")
    setEmergencyPhone(p.emergencyContactPhone || "")
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !lastName || !email || !dob) {
      toast.warn("Please fill all required fields.")
      return
    }
    const payload = {
      firstName, lastName, email, phoneNumber: phone,
      dateOfBirth: dob, gender, bloodGroup,
      address, city, emergencyContactName: emergencyName, emergencyContactPhone: emergencyPhone,
    }
    try {
      if (editingPatient) {
        const res = await apiClient.put<ApiResponse<PatientDto>>(`/patients/${editingPatient.id}`, payload)
        if (res.data.success) { toast.success("Patient updated."); loadData() }
      } else {
        const res = await apiClient.post<ApiResponse<PatientDto>>("/patients", payload)
        if (res.data.success) { toast.success("Patient registered."); loadData() }
      }
      setIsModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to save patient.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this patient record?")) return
    try {
      const res = await apiClient.delete<ApiResponse>(`/patients/${id}`)
      if (res.data.success) { toast.success("Patient deleted."); loadData() }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete.")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" /> Patients Directory
          </h2>
          <p className="text-sm text-muted-foreground mt-1">View, register and manage patient records</p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Register Patient
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Search by name, ID, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Emergency Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No patients found.</TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell><span className="font-mono text-xs px-2 py-1 rounded bg-primary/10 text-primary">{p.patientNumber}</span></TableCell>
                  <TableCell>
                    <div className="font-semibold">{p.patientName}</div>
                    <div className="text-xs text-muted-foreground">{p.email}</div>
                  </TableCell>
                  <TableCell>{GENDER_LABELS[p.gender] || "—"}</TableCell>
                  <TableCell>{p.bloodGroup ? BLOOD_GROUP_LABELS[p.bloodGroup] : "—"}</TableCell>
                  <TableCell>{p.city || "—"}</TableCell>
                  <TableCell>
                    {p.emergencyContactName ? (
                      <div>
                        <div className="text-sm font-medium">{p.emergencyContactName}</div>
                        <div className="text-xs text-muted-foreground">{p.emergencyContactPhone}</div>
                      </div>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(p)}><Edit2 className="w-4 h-4 text-muted-foreground" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={editingPatient ? "Edit Patient" : "Register Patient"}
        description={editingPatient ? "Update patient details." : "Create a new patient record."} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={!!editingPatient} />
            <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={!!editingPatient} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={!!editingPatient} />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Date of Birth" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground/80">Gender</label>
              <select className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={gender} onChange={(e) => setGender(Number(e.target.value))}>
                {Object.entries(GENDER_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground/80">Blood Group</label>
              <select className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={bloodGroup ?? ""} onChange={(e) => setBloodGroup(e.target.value ? Number(e.target.value) : undefined)}>
                <option value="">— Unknown —</option>
                {Object.entries(BLOOD_GROUP_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Emergency Contact Name" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
            <Input label="Emergency Contact Phone" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
