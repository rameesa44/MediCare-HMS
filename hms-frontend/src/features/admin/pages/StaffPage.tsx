import React, { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, Users } from "lucide-react"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import apiClient from "@/api/client"
import type { ApiResponse } from "@/types"

interface StaffDto {
  id: string
  userId: string
  staffName: string
  email: string
  phone?: string
  departmentId?: string
  departmentName: string
  designation: string
  staffType: number
  employeeId?: string
  joiningDate?: string
  assignedWardId?: string
  assignedWardName: string
}

interface DepartmentDto { id: string; name: string }
interface WardDto { id: string; name: string }

const STAFF_TYPE_LABELS: Record<number, string> = {
  1: "Receptionist",
  2: "Ward Staff",
  3: "Lab Technician",
  4: "Nurse",
}

export const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<StaffDto[]>([])
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [wards, setWards] = useState<WardDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffDto | null>(null)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [designation, setDesignation] = useState("")
  const [staffType, setStaffType] = useState(2)
  const [departmentId, setDepartmentId] = useState("")
  const [assignedWardId, setAssignedWardId] = useState("")

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [staffRes, deptRes, wardRes] = await Promise.all([
        apiClient.get<ApiResponse<StaffDto[]>>("/staff"),
        apiClient.get<ApiResponse<DepartmentDto[]>>("/departments"),
        apiClient.get<ApiResponse<WardDto[]>>("/wards"),
      ])
      if (staffRes.data.success && staffRes.data.data) setStaff(staffRes.data.data)
      if (deptRes.data.success && deptRes.data.data) setDepartments(deptRes.data.data)
      if (wardRes.data.success && wardRes.data.data) setWards(wardRes.data.data)
    } catch (err: any) {
      toast.error(err.message || "Failed to load data.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleOpenCreate = () => {
    setEditingStaff(null)
    setFirstName(""); setLastName(""); setEmail(""); setPhone("")
    setDesignation(""); setStaffType(2)
    setDepartmentId(departments[0]?.id || "")
    setAssignedWardId("")
    setIsModalOpen(true)
  }

  const handleOpenEdit = (s: StaffDto) => {
    setEditingStaff(s)
    const [f, ...l] = s.staffName.split(" ")
    setFirstName(f || ""); setLastName(l.join(" ") || "")
    setEmail(s.email); setPhone(s.phone || "")
    setDesignation(s.designation); setStaffType(s.staffType)
    setDepartmentId(s.departmentId || "")
    setAssignedWardId(s.assignedWardId || "")
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !lastName || !email || !designation) {
      toast.warn("Please fill required fields.")
      return
    }
    try {
      if (editingStaff) {
        const res = await apiClient.put<ApiResponse<StaffDto>>(`/staff/${editingStaff.id}`, {
          designation, staffType,
          departmentId: departmentId || null,
          assignedWardId: assignedWardId || null,
        })
        if (res.data.success) { toast.success("Staff updated."); loadData() }
      } else {
        const res = await apiClient.post<ApiResponse<StaffDto>>("/staff", {
          firstName, lastName, email, password: "Staff123!",
          phoneNumber: phone, designation, staffType,
          departmentId: departmentId || null,
          assignedWardId: assignedWardId || null,
        })
        if (res.data.success) { toast.success("Staff created."); loadData() }
      }
      setIsModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to save staff.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this staff member?")) return
    try {
      const res = await apiClient.delete<ApiResponse>(`/staff/${id}`)
      if (res.data.success) { toast.success("Staff deleted."); loadData() }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete.")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" />
            Staff Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage hospital staff, roles, and ward assignments</p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Staff Member
        </Button>
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
                <TableHead>Name</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Ward</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No staff members found.</TableCell></TableRow>
              ) : staff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-semibold">{s.staffName}</div>
                    <div className="text-xs text-muted-foreground">{s.email}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{s.employeeId || "—"}</TableCell>
                  <TableCell>{s.designation}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary">
                      {STAFF_TYPE_LABELS[s.staffType] || "Unknown"}
                    </span>
                  </TableCell>
                  <TableCell>{s.departmentName || "—"}</TableCell>
                  <TableCell>{s.assignedWardName || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(s)}><Edit2 className="w-4 h-4 text-muted-foreground" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={editingStaff ? "Edit Staff Member" : "Add Staff Member"}
        description={editingStaff ? "Update staff info and assignment." : "Register a new staff member."} size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          {!editingStaff && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Designation" placeholder="e.g. Senior Nurse" value={designation} onChange={(e) => setDesignation(e.target.value)} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground/80">Staff Type</label>
              <select className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={staffType} onChange={(e) => setStaffType(Number(e.target.value))}>
                {Object.entries(STAFF_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground/80">Department</label>
              <select className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <option value="">— None —</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground/80">Assigned Ward</label>
              <select className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={assignedWardId} onChange={(e) => setAssignedWardId(e.target.value)}>
                <option value="">— None —</option>
                {wards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
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
