import { FoodScanPage } from "@/components/food-scan";
import DashboardRoleGate from "@/components/dashboard/DashboardRoleGate";

export default function FoodScanRoute() {
  return <DashboardRoleGate allowedRoles={["patient"]}><FoodScanPage /></DashboardRoleGate>;
}
