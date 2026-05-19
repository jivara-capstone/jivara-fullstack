export interface MedicationScheduleCreateDTO {
  patientId: string;
  prescriptionId?: string;
  drugName: string;
  dosage: string;
  stock?: number;
  frequency: number;
  scheduledTimes: string[];
  instructions?: string;
  reminderEnabled?: boolean;
  isActive?: boolean;
}

export interface MedicationScheduleUpdateDTO {
  prescriptionId?: string | null;
  drugName?: string;
  dosage?: string;
  stock?: number;
  frequency?: number;
  scheduledTimes?: string[];
  instructions?: string | null;
  reminderEnabled?: boolean;
  isActive?: boolean;
}

export interface MedicationScheduleListQuery {
  patient_id?: string;
  patientId?: string;
  is_active?: string;
  isActive?: string;
}
