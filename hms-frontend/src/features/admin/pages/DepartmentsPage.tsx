import React, { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, ShieldCheck, ShieldAlert, Layers } from "lucide-react"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import apiClient from "@/api/client"
import type { ApiResponse } from "@/types"

interface DepartmentDto {
  id: string
  name: string
  description?: string
  iconName?: string
  isActive: boolean
  headDoctorId?: string
  headDoctorName?: string
  doctorCount: number
}

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<DepartmentDto | null>(null)
  
  // Form fields
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  const fetchDepartments = async () => {
    setIsLoading(true)
    try {
      const res = await apiClient.get<ApiResponse<DepartmentDto[]>>("/departments")
      if (res.data.success && res.data.data) {
        setDepartments(res.data.data)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load departments.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const handleOpenCreate = () => {
    setEditingDept(null)
    setName("")
    setDescription("")
    setIsModalOpen(true)
  }

  const handleOpenEdit = (dept: DepartmentDto) => {
    setEditingDept(dept)
    setName(dept.name)
    setDescription(dept.description || "")
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.warn("Name is required.")
      return
    }

    try {
      if (editingDept) {
        // Edit API
        const res = await apiClient.put<ApiResponse<DepartmentDto>>(`/departments/${editingDept.id}`, {
          name,
          description,
        })
        if (res.data.success) {
          toast.success("Department updated successfully.")
          fetchDepartments()
        }
      } else {
        // Create API
        const res = await apiClient.post<ApiResponse<DepartmentDto>>("/departments", {
          name,
          description,
        })
        if (res.data.success) {
          toast.success("Department created successfully.")
          fetchDepartments()
        }
      }
      setIsModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Failed to save department.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return
    try {
      const res = await apiClient.delete<ApiResponse>(`/departments/${id}`)
      if (res.data.success) {
        toast.success("Department deleted successfully.")
        fetchDepartments()
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete department.")
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Layers className="w-7 h-7 text-primary" />
            Departments
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Configure and manage clinical departments</p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
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
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Head of Dept</TableHead>
                <TableHead>Doctor Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No departments found. Create one to get started!
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-bold">{dept.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{dept.description || "N/A"}</TableCell>
                    <TableCell>{dept.headDoctorName || "None Assigned"}</TableCell>
                    <TableCell>{dept.doctorCount}</TableCell>
                    <TableCell>
                      {dept.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-green-500/10 text-green-500">
                          <ShieldCheck className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-destructive/10 text-destructive">
                          <ShieldAlert className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(dept)}>
                          <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id)}>
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
        title={editingDept ? "Edit Department" : "Add Department"}
        description={editingDept ? "Modify department details." : "Create a new hospital department."}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Department Name"
            placeholder="e.g. Cardiology"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-foreground/80">Description</label>
            <textarea
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-24"
              placeholder="Provide a detailed description of department activities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
