import Dexie, { type Table } from "dexie"

export interface OfflineSyncItem {
  id?: number
  action: "CREATE_PATIENT" | "CREATE_APPOINTMENT" | "UPDATE_VITALS" | "ADD_DAILY_NOTE"
  payload: any
  timestamp: number
  synced: number // 0 = pending, 1 = synced, 2 = failed
  errorMessage?: string
}

export interface OfflinePatient {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  patientNumber?: string
  gender: number
  dateOfBirth: string
  isLocal: boolean // true if created offline and not synced yet
}

export interface OfflineAppointment {
  id: string
  patientId: string
  doctorId: string
  appointmentDate: string
  reason?: string
  status: number
  isLocal: boolean
}

export class MediCareOfflineDb extends Dexie {
  syncQueue!: Table<OfflineSyncItem, number>
  patients!: Table<OfflinePatient, string>
  appointments!: Table<OfflineAppointment, string>

  constructor() {
    super("MediCareOfflineDb")
    this.version(1).stores({
      syncQueue: "++id, action, timestamp, synced",
      patients: "id, email, patientNumber, isLocal",
      appointments: "id, patientId, doctorId, isLocal",
    })
  }
}

export const db = new MediCareOfflineDb()
