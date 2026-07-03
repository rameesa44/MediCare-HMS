import React, { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, UserCheck, ShieldCheck, Mail, Phone, Award } from "lucide-react"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import apiClient from "@/api/client"
import type { ApiResponse } from "@/types"

interface DoctorDto {
  id: string
  userId: string
  doctorName: string
  email: string
  phone?: string
  profileImage?: string
  departmentId: string
  departmentName: string
  specialization: string
  qualification?: string
  experienceYears: number
  consultationFee: decimal
  bio?: string
  isAvailable: boolean
}

interface DepartmentDto {
  id: string
  name: string
}

export const DoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<DoctorDto[]>([])
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState<DoctorDto | null>(null)

  // Form fields
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [qualification, setQualification] = useState("")
  const [experienceYears, setExperienceYears] = useState(1)
  const [consultationFee, setConsultationFee] = useState(100)
  const [bio, setBio] = useState("")

  const loadData = async () => {
    setIsLoading(true)
    try {
      const docRes = await apiClient.get<ApiResponse<DoctorDto[]>>("/doctors")
      const deptRes = await apiClient.get<ApiResponse<DepartmentDto[]>>("/departments")

      if (docRes.data.success && docRes.data.data) {
        setDoctors(docRes.data.data)
      }
      if (deptRes.data.success && deptRes.data.data) {
        setDepartments(deptRes.data.data)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load data.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingDoc(null)
    setFirstName("")
    setLastName("")
    setEmail("")
    setPassword("")
    setPhone("")
    setDepartmentId(departments[0]?.id || "")
    setSpecialization("")
    setQualification("")
    setExperienceYears(1)
    setConsultationFee(100)
    setBio("")
    setIsModalOpen(true)
  }

  const handleOpenEdit = (doc: DoctorDto) => {
    setEditingDoc(doc)
    const [first, ...lastArr] = doc.doctorName.split(" ")
    setFirstName(first || "")
    setLastName(lastArr.join(" ") || "")
    setEmail(doc.email)
    setPassword("*****") // hidden placeholder
    setPhone(doc.phone || "")
    setDepartmentId(doc.departmentId)
    setSpecialization(doc.specialization)
    setQualification(doc.qualification || "")
    setExperienceYears(doc.experienceYears)
    setConsultationFee(doc.consultationFee)
    setBio(doc.bio || "")
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !departmentId) {
      toast.warn("Please populate required fields.")
      return
    }

    try {
      if (editingDoc) {
        const res = await apiClient.put<ApiResponse<DoctorDto>>(`/doctors/${editingDoc.id}`, {
          firstName,
          lastName,
          phoneNumber: phone,
          departmentId,
          specialization,
          qualification,
          experienceYears,
          consultationFee,
          bio,
        })
        if (res.data.success) {
          toast.success("Doctor details updated successfully.")
          loadData()
        }
      } else {
        const res = await apiClient.post<ApiResponse<DoctorDto>>("/doctors", {
          firstName,
          lastName,
          email,
          password: password || "Doctor123!",
          phoneNumber: phone,
          departmentId,
          specialization,
          qualification,
          experienceYears,
          consultationFee,
          bio,
        })
        if (res.data.success) {
          toast.success("Doctor registered successfully.")
          loadData()
        }
      }
      setIsModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to save doctor.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this doctor?")) return
    try {
      const res = await apiClient.delete<ApiResponse>(`/doctors/${id}`)
      if (res.data.success) {
        toast.success("Doctor deleted successfully.")
        loadData()
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete doctor.")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-primary" />
            Doctors Directory
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage clinical doctors, consulting credentials, and availability</p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Doctor</span>
        </Button>
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
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Consultation Fee</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No doctors registered yet. Add a doctor to begin!
                  </TableCell>
                </TableRow>
              ) : (
                doctors.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">{doc.doctorName}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {doc.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{doc.departmentName}</TableCell>
                    <TableCell>{doc.specialization}</TableCell>
                    <TableCell>{doc.qualification || "N/A"}</TableCell>
                    <TableCell>${doc.consultationFee}</TableCell>
                    <TableCell>
                      {doc.isAvailable ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-green-500/10 text-green-500">
                          <ShieldCheck className="w-3.5 h-3.5" /> Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-orange-500/10 text-orange-500">
                          On Leave
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(doc)}>
                          <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </motion.div>
      )}

      {/* Save Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoc ? "Edit Doctor Profile" : "Register Doctor"}
        description={editingDoc ? "Modify doctor specialty and profile info." : "Create user account and linked doctor profile."}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="e.g. John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              placeholder="e.g. Smith"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. doc.smith@medicare.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!editingDoc}
            />
            {!editingDoc && (
              <Input
                label="Login Password"
                type="password"
                placeholder="Defaults to: Doctor123!"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}
            {editingDoc && (
              <Input
                label="Phone Number"
                placeholder="e.g. 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            )}
          </div>

          {!editingDoc && (
            <Input
              label="Phone Number"
              placeholder="e.g. 555-0199"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground/80">Department</label>
              <select
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Specialization"
              placeholder="e.g. Cardiologist"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Qualification"
              placeholder="e.g. MD, FACC"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
            />
            <Input
              label="Experience (Years)"
              type="number"
              value={experienceYears}
              onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
              min={0}
            />
            <Input
              label="Consultation Fee ($)"
              type="number"
              value={consultationFee}
              onChange={(e) => setConsultationFee(parseFloat(e.target.value) || 0)}
              min={0}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground/80">Bio/Description</label>
            <textarea
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-20"
              placeholder="Biography or medical specialty description..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
