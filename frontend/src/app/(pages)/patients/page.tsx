import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PatientListPage } from "@/components/patients";

export default function PatientsPage() {
  return (
    <DashboardLayout>
      <PatientListPage />
    </DashboardLayout>
  );
}
