import type { FoodScanRecord, FoodScanRisk } from "@/lib/mocks/foodScans";
import { foodScans } from "@/lib/mocks/foodScans";
import type { MedicationScheduleRecord } from "@/lib/mocks/schedules";
import { medicationSchedules } from "@/lib/mocks/schedules";

export interface FoodDrugInteraction {
  readonly schedule: MedicationScheduleRecord;
  readonly risk: FoodScanRisk;
  readonly reasoning: string;
  readonly recommendation: string;
}

export interface FoodScanAnalysis {
  readonly scan: FoodScanRecord;
  readonly schedules: readonly MedicationScheduleRecord[];
  readonly interactions: readonly FoodDrugInteraction[];
  readonly overallRisk: FoodScanRisk;
}

export function getFoodScanAnalysis(scanId: string): FoodScanAnalysis | null {
  const scan = foodScans.find((currentScan) => currentScan.id === scanId);
  if (!scan) return null;

  const schedules = medicationSchedules.filter((schedule) => schedule.patientId === scan.patientId);
  const interactions = schedules.map((schedule, index) => createInteraction(scan, schedule, index));
  const overallRisk: FoodScanRisk = interactions.some((interaction) => interaction.risk === "High Risk") ? "High Risk" : "Low Risk";

  return { scan, schedules, interactions, overallRisk };
}

function createInteraction(scan: FoodScanRecord, schedule: MedicationScheduleRecord, index: number): FoodDrugInteraction {
  const isActiveHighRisk = scan.risk === "High Risk" && schedule.status === "Aktif";
  const risk: FoodScanRisk = isActiveHighRisk ? "High Risk" : "Low Risk";

  if (risk === "High Risk") {
    return {
      schedule,
      risk,
      reasoning: `${scan.foodName} perlu diwaspadai saat pasien menggunakan ${schedule.medicineName} karena profil makanan dapat mengganggu efektivitas atau toleransi obat aktif.`,
      recommendation: `Beri jeda konsumsi, pantau gejala pasien, dan konfirmasi ulang instruksi ${schedule.medicineName} sebelum pasien menandai obat sudah diminum.`,
    };
  }

  const lowRiskReasons = [
    `${scan.foodName} tidak menunjukkan sinyal interaksi signifikan dengan ${schedule.medicineName} berdasarkan jadwal dan aturan makan saat ini.`,
    `${schedule.medicineName} dapat tetap dipantau sesuai jadwal karena makanan ini tidak memicu risiko utama pada data scan.`,
    `Risiko terhadap ${schedule.medicineName} rendah, terutama bila pasien tetap mengikuti aturan ${schedule.mealRule.toLowerCase()}.`,
  ];

  return {
    schedule,
    risk,
    reasoning: lowRiskReasons[index % lowRiskReasons.length],
    recommendation: `Pasien dapat melanjutkan jadwal ${schedule.medicineName} sesuai instruksi dan tetap melakukan scan pada konsumsi berikutnya.`,
  };
}
