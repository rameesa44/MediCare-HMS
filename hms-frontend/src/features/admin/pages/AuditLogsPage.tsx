import React, { useEffect, useState } from "react"
import { ShieldAlert, RefreshCw, Search, Clock } from "lucide-react"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import apiClient from "@/api/client"
import type { ApiResponse } from "@/types"

interface AuditLogDto {
  id: string
  userId?: string
  userFullName: string
  userEmail: string
  action: string
  entityName?: string
  entityId?: string
  createdAt: string
  ipAddress?: string
}

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogDto[]>([])
  const [filtered, setFiltered] = useState<AuditLogDto[]>([])
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const loadLogs = async () => {
    setIsLoading(true)
    try {
      const res = await apiClient.get<ApiResponse<AuditLogDto[]>>("/audit-logs")
      if (res.data.success && res.data.data) {
        setLogs(res.data.data)
        setFiltered(res.data.data)
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load audit logs.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadLogs() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(logs.filter(l =>
      l.action.toLowerCase().includes(q) ||
      l.userFullName.toLowerCase().includes(q) ||
      (l.entityName && l.entityName.toLowerCase().includes(q))
    ))
  }, [search, logs])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-primary" />
            Audit Logs
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Review system administrator activities, configuration adjustments and security events</p>
        </div>
        <Button variant="outline" onClick={loadLogs} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="flex h-11 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Search by action, user or entity..."
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
                <TableHead>Timestamp</TableHead>
                <TableHead>User / Role</TableHead>
                <TableHead>Action Details</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Record ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No audit logs logged in database.</TableCell></TableRow>
              ) : filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {new Date(l.createdAt).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-foreground">{l.userFullName || "System"}</div>
                    {l.userEmail && <div className="text-xs text-muted-foreground">{l.userEmail}</div>}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{l.action}</TableCell>
                  <TableCell>
                    {l.entityName ? (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
                        {l.entityName}
                      </span>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{l.entityId || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      )}
    </div>
  )
}
