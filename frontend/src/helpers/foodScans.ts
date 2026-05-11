import type { FoodScanRecord, FoodScanRisk } from "@/lib/mocks/foodScans";
import type { MedicationScheduleRecord } from "@/lib/mocks/schedules";

export interface FoodDrugInteraction {
  readonly schedule: MedicationScheduleRecord;
  readonly risk: FoodScanRisk;
  readonly reasoning: string;
  readonly recommendation: string;
}

export interface FoodScanAnalysis {
  readonly scan: FoodScanRecord;
  readonly patientName?: string;
  readonly schedules: readonly MedicationScheduleRecord[];
  readonly interactions: readonly FoodDrugInteraction[];
  readonly overallRisk: FoodScanRisk;
}
