import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { ActivityLogPage } from "@/components/activity-log";

interface ActivityLogRouteProps {
  readonly searchParams?: Promise<{
    readonly patientName?: string;
    readonly category?: string;
  }>;
}

export default async function ActivityLogRoute({ searchParams }: ActivityLogRouteProps) {
  const params = await searchParams;

  return (
    <DashboardLayout>
      <ActivityLogPage initialPatientName={params?.patientName} initialCategory={params?.category} />
    </DashboardLayout>
  );
}
