import { create } from "zustand";
import type { FoodScanRecord } from "@/lib/mocks/foodScans";

interface PatientDashboardState {
  readonly lastScan: FoodScanRecord | null;
  readonly confirmedMedicineIds: readonly string[];
  readonly setLastScan: (scan: FoodScanRecord) => void;
  readonly confirmMedicine: (medicineId: string) => void;
  readonly resetPatientDashboardState: () => void;
}

export const usePatientDashboardStore = create<PatientDashboardState>()((set) => ({
  lastScan: null,
  confirmedMedicineIds: [],
  setLastScan: (scan) => set({ lastScan: scan }),
  confirmMedicine: (medicineId) =>
    set((state) => ({
      confirmedMedicineIds: state.confirmedMedicineIds.includes(medicineId)
        ? state.confirmedMedicineIds
        : [...state.confirmedMedicineIds, medicineId],
    })),
  resetPatientDashboardState: () => set({ lastScan: null, confirmedMedicineIds: [] }),
}));
