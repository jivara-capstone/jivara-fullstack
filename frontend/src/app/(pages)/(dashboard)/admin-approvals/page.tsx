import { AdminApprovalsPage } from "@/components/admin";
import DashboardRoleGate from "@/components/dashboard/DashboardRoleGate";

export default function AdminApprovalsRoute() {
  return <DashboardRoleGate allowedRoles={["super_admin"]}><AdminApprovalsPage /></DashboardRoleGate>;
}
