import type { AccountStatus } from "@/types/auth";

const statusLabels: Record<AccountStatus, string> = {
  pending: "Menunggu",
  active: "Aktif",
  rejected: "Ditolak",
  suspended: "Ditangguhkan",
};

const statusClasses: Record<AccountStatus, string> = {
  pending: "bg-warning/10 text-warning",
  active: "bg-primary/10 text-primary",
  rejected: "bg-danger/10 text-danger",
  suspended: "bg-muted/10 text-muted",
};

function normalizeStatus(status?: string | null): AccountStatus {
  if (status === "pending" || status === "rejected" || status === "suspended") return status;
  return "active";
}

export default function AccountStatusBadge({ status }: { readonly status?: string | null }) {
  const normalizedStatus = normalizeStatus(status);

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${statusClasses[normalizedStatus]}`}>
      {statusLabels[normalizedStatus]}
    </span>
  );
}
