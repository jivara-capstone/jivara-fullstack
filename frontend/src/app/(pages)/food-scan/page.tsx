import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FoodScanPage } from "@/components/food-scan";

export default function FoodScanRoute() {
  return (
    <DashboardLayout>
      <FoodScanPage />
    </DashboardLayout>
  );
}
