import { notFound } from "next/navigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { PatientDetailPage } from "@/components/patients/detail";
import { getPatientDetailData } from "@/helpers/patientDetails";

interface PatientDetailRouteProps {
  readonly params: Promise<{
    readonly id: string;
  }>;
}

export default async function PatientDetailRoute({ params }: PatientDetailRouteProps) {
  const { id } = await params;
  const data = getPatientDetailData(decodeURIComponent(id));

  if (!data) notFound();

  return (
    <DashboardLayout>
      <PatientDetailPage data={data} />
    </DashboardLayout>
  );
}
