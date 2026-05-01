export interface PrescriptionCreateDTO {
  patientId: string;
  diagnosis?: string;
  prescribingDoctor?: string;
  startDate?: string;
  endDate?: string;
}

export interface PrescriptionUpdateDTO {
  diagnosis?: string | null;
  prescribingDoctor?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface PrescriptionListQuery {
  patient_id?: string;
  patientId?: string;
}
