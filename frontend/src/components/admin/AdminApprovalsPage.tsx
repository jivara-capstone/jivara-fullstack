"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Ban, CheckCircle2, Clock3, PauseCircle, Power, RotateCcw, XCircle } from "lucide-react";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import DashboardPageShell from "@/components/dashboard/DashboardPageShell";
import PatientPagination from "@/components/patients/PatientPagination";
import Button from "@/components/ui/Button";
import FilterPills from "@/components/ui/FilterPills";
import IconActionButton from "@/components/ui/IconActionButton";
import Modal from "@/components/ui/Modal";
import SearchField from "@/components/ui/SearchField";
import SummaryCardGrid from "@/components/ui/SummaryCardGrid";
import ToolbarCard from "@/components/ui/ToolbarCard";
import api from "@/lib/axios";
import { showConfirm, showError, showToast } from "@/lib/swal";
import type { User } from "@/types/auth";
import { useAuthStore } from "@/store/auth";
import AccountStatusBadge from "./AccountStatusBadge";

type AdminApprovalSummary = {
  readonly pending: number;
  readonly active: number;
  readonly rejected: number;
  readonly suspended: number;
};

const emptySummary: AdminApprovalSummary = { pending: 0, active: 0, rejected: 0, suspended: 0 };
type ApprovalFilter = "all" | "pending" | "active" | "rejected" | "suspended";

const approvalFilters: { readonly label: string; readonly value: ApprovalFilter }[] = [
  { label: "Semua", value: "all" },
  { label: "Menunggu", value: "pending" },
  { label: "Diterima", value: "active" },
  { label: "Tolak", value: "rejected" },
  { label: "Suspend", value: "suspended" },
];

const pageSize = 10;

export default function AdminApprovalsPage() {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const hasAuthHydrated = useAuthStore((state) => state.hasHydrated);
  const [approvals, setApprovals] = useState<User[]>([]);
  const [summary, setSummary] = useState<AdminApprovalSummary>(emptySummary);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ApprovalFilter>("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingUser, setRejectingUser] = useState<User | null>(null);
  const deferredSearch = useDeferredValue(search);

  const filteredApprovals = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    return approvals.filter((user) => {
      const status = user.accountStatus ?? "active";
      const matchesFilter = filter === "all" || status === filter;
      const matchesSearch = !query || [user.fullName, user.email, user.phone ?? ""].some((value) => value.toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
    });
  }, [approvals, deferredSearch, filter]);
  const totalPages = Math.max(1, Math.ceil(filteredApprovals.length / pageSize));
  const paginatedApprovals = filteredApprovals.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = [
    { label: "Menunggu", value: String(summary.pending), tone: summary.pending ? "critical" as const : "safe" as const, color: "lime" as const, icon: Clock3 },
    { label: "Diterima", value: String(summary.active), tone: "safe" as const, color: "leaf" as const, icon: CheckCircle2 },
    { label: "Tolak", value: String(summary.rejected), tone: summary.rejected ? "critical" as const : "neutral" as const, color: "danger" as const, icon: Ban },
    { label: "Suspend", value: String(summary.suspended), tone: summary.suspended ? "critical" as const : "neutral" as const, color: "pine" as const, icon: PauseCircle },
  ];

  const loadApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/auth/admin-approvals");
      setApprovals(response.data.data.users ?? []);
      setSummary(response.data.data.summary ?? emptySummary);
    } catch {
      showError("Gagal memuat daftar pengajuan admin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasAuthHydrated) return;
    if (role !== "super_admin") {
      router.replace("/dashboard");
      return;
    }
    void Promise.resolve().then(loadApprovals);
  }, [hasAuthHydrated, loadApprovals, role, router]);

  if (!hasAuthHydrated || role !== "super_admin") return null;

  const handleApprove = async (user: User) => {
    const result = await showConfirm("Setujui Admin?", `${user.fullName} akan aktif sebagai admin Jivara.`, "Ya, Setujui");
    if (!result.isConfirmed) return;

    setProcessingId(user.id);
    try {
      await api.post(`/auth/admin-approvals/${encodeURIComponent(user.id)}/approve`);
      setApprovals((current) => current.filter((item) => item.id !== user.id));
      setSummary((current) => ({ ...current, pending: Math.max(0, current.pending - 1), active: current.active + 1 }));
      showToast("Admin berhasil disetujui.", "success");
    } catch {
      showError("Gagal menyetujui pengajuan admin.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectingUser) return;
    setProcessingId(rejectingUser.id);
    try {
      await api.post(`/auth/admin-approvals/${encodeURIComponent(rejectingUser.id)}/reject`, { reason });
      setApprovals((current) => current.filter((item) => item.id !== rejectingUser.id));
      setSummary((current) => ({ ...current, pending: Math.max(0, current.pending - 1), rejected: current.rejected + 1 }));
      setRejectingUser(null);
      showToast("Pengajuan admin ditolak.");
    } catch {
      showError("Gagal menolak pengajuan admin.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleActivate = async (user: User) => {
    const result = await showConfirm("Aktifkan Admin?", `${user.fullName} akan aktif kembali sebagai admin Jivara.`, "Ya, Aktifkan");
    if (!result.isConfirmed) return;

    setProcessingId(user.id);
    try {
      await api.post(`/auth/admin-approvals/${encodeURIComponent(user.id)}/activate`);
      setApprovals((current) => current.map((item) => item.id === user.id ? { ...item, accountStatus: "active" } : item));
      setSummary((current) => ({ ...current, suspended: Math.max(0, current.suspended - 1), active: current.active + 1 }));
      showToast("Admin berhasil diaktifkan kembali.", "success");
    } catch {
      showError("Gagal mengaktifkan admin.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleSuspend = async (user: User) => {
    const result = await showConfirm("Suspend Admin?", `${user.fullName} tidak akan bisa mengakses dashboard admin sampai diaktifkan kembali.`, "Ya, Suspend");
    if (!result.isConfirmed) return;

    setProcessingId(user.id);
    try {
      await api.post(`/auth/admin-approvals/${encodeURIComponent(user.id)}/suspend`);
      setApprovals((current) => current.map((item) => item.id === user.id ? { ...item, accountStatus: "suspended" } : item));
      setSummary((current) => ({ ...current, active: Math.max(0, current.active - 1), suspended: current.suspended + 1 }));
      showToast("Admin berhasil disuspend.", "success");
    } catch {
      showError("Gagal suspend admin.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRestore = async (user: User) => {
    const result = await showConfirm("Pulihkan Pengajuan?", `${user.fullName} akan dikembalikan ke status menunggu approval.`, "Ya, Pulihkan");
    if (!result.isConfirmed) return;

    setProcessingId(user.id);
    try {
      await api.post(`/auth/admin-approvals/${encodeURIComponent(user.id)}/restore`);
      setApprovals((current) => current.map((item) => item.id === user.id ? { ...item, accountStatus: "pending", rejectedReason: null, rejectedAt: null } : item));
      setSummary((current) => ({ ...current, rejected: Math.max(0, current.rejected - 1), pending: current.pending + 1 }));
      showToast("Pengajuan admin berhasil dipulihkan.", "success");
    } catch {
      showError("Gagal memulihkan pengajuan admin.");
    } finally {
      setProcessingId(null);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setFilter("pending");
    setCurrentPage(1);
  };

  return (
    <DashboardPageShell>
      <DashboardPageHeader title="Persetujuan Admin" />
      <SummaryCardGrid stats={stats} desktopColumns={4} />

      <motion.div className="mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}>
        <ToolbarCard>
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <SearchField id="adminApprovalSearch" value={search} placeholder="Cari admin ..." onChange={(value) => { setSearch(value); setCurrentPage(1); }} />
            {(search || filter !== "pending") && <Button type="button" size="sm" variant="outline" onClick={resetFilters}>Reset</Button>}
          </div>
          <FilterPills options={approvalFilters} activeValue={filter} onChange={(value) => { setFilter(value); setCurrentPage(1); }} className="mt-4" />
        </ToolbarCard>
      </motion.div>

      <motion.section className="mt-6 overflow-hidden rounded-3xl bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)]" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
        {loading ? <ApprovalSkeleton /> : <ApprovalList approvals={paginatedApprovals} activeFilter={filter} processingId={processingId} onApprove={handleApprove} onActivate={handleActivate} onSuspend={handleSuspend} onRestore={handleRestore} onReject={setRejectingUser} />}
        <PatientPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredApprovals.length}
          pageSize={pageSize}
          itemLabel="admin"
          onPageChange={(page) => setCurrentPage(Math.min(Math.max(page, 1), totalPages))}
        />
      </motion.section>

      <RejectApprovalModal key={rejectingUser?.id ?? "empty"} user={rejectingUser} loading={processingId === rejectingUser?.id} onClose={() => setRejectingUser(null)} onSubmit={handleReject} />
    </DashboardPageShell>
  );
}

function ApprovalList({ approvals, activeFilter, processingId, onApprove, onActivate, onSuspend, onRestore, onReject }: { readonly approvals: User[]; readonly activeFilter: ApprovalFilter; readonly processingId: string | null; readonly onApprove: (user: User) => void; readonly onActivate: (user: User) => void; readonly onSuspend: (user: User) => void; readonly onRestore: (user: User) => void; readonly onReject: (user: User) => void }) {
  if (approvals.length === 0) {
    return <div className="px-6 py-14 text-center text-sm font-bold text-muted">{getEmptyApprovalMessage(activeFilter)}</div>;
  }

  return (
    <>
      <div className="hidden overflow-x-auto sm:block" data-lenis-prevent>
        <table className="w-full text-left">
          <thead className="bg-surface text-xs font-extrabold uppercase tracking-[0.08em] text-muted">
            <tr>
              <th className="px-5 py-4">Admin</th>
              <th className="px-5 py-4">Kontak</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Tanggal Daftar</th>
              <th className="px-5 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {approvals.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-surface/60">
                <td className="px-5 py-4 font-extrabold text-text-main">{user.fullName}</td>
                <td className="px-5 py-4 text-sm font-bold text-muted"><span className="block text-text-main">{user.email}</span>{user.phone ?? "-"}</td>
                <td className="px-5 py-4"><AccountStatusBadge status={user.accountStatus} /></td>
                <td className="px-5 py-4 text-sm font-bold text-muted">{user.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID") : "-"}</td>
                <td className="px-5 py-4"><ApprovalActions user={user} processingId={processingId} onApprove={onApprove} onActivate={onActivate} onSuspend={onSuspend} onRestore={onRestore} onReject={onReject} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-line sm:hidden">
        {approvals.map((user) => (
          <article key={user.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="break-words font-display text-xl font-extrabold tracking-[-0.04em] text-text-main">{user.fullName}</h2>
              <AccountStatusBadge status={user.accountStatus} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-muted">
              <span>{user.email}</span>
              {user.phone && <span>{user.phone}</span>}
              {user.createdAt && <span>Daftar {new Date(user.createdAt).toLocaleDateString("id-ID")}</span>}
            </div>
            <div className="mt-4">
              <ApprovalActions user={user} processingId={processingId} onApprove={onApprove} onActivate={onActivate} onSuspend={onSuspend} onRestore={onRestore} onReject={onReject} />
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function getEmptyApprovalMessage(filter: ApprovalFilter) {
  const messages: Record<ApprovalFilter, string> = {
    all: "Belum ada data admin.",
    pending: "Tidak ada pengajuan admin yang menunggu persetujuan.",
    active: "Tidak ada admin yang diterima.",
    rejected: "Tidak ada pengajuan admin yang ditolak.",
    suspended: "Tidak ada admin yang disuspend.",
  };

  return messages[filter];
}

function ApprovalActions({ user, processingId, onApprove, onActivate, onSuspend, onRestore, onReject }: { readonly user: User; readonly processingId: string | null; readonly onApprove: (user: User) => void; readonly onActivate: (user: User) => void; readonly onSuspend: (user: User) => void; readonly onRestore: (user: User) => void; readonly onReject: (user: User) => void }) {
  if ((user.accountStatus ?? "active") === "active") {
    return (
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <IconActionButton label={`Suspend ${user.fullName}`} tone="warning" disabled={processingId === user.id} onClick={() => onSuspend(user)}><PauseCircle size={16} /></IconActionButton>
      </div>
    );
  }

  if (user.accountStatus === "suspended") {
    return (
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <IconActionButton label={`Aktifkan kembali ${user.fullName}`} tone="blue" disabled={processingId === user.id} onClick={() => onActivate(user)}><Power size={16} /></IconActionButton>
      </div>
    );
  }

  if (user.accountStatus === "rejected") {
    return (
      <div className="flex flex-wrap gap-2 sm:justify-end">
        <IconActionButton label={`Pulihkan ${user.fullName}`} tone="warning" disabled={processingId === user.id} onClick={() => onRestore(user)}><RotateCcw size={16} /></IconActionButton>
      </div>
    );
  }

  if (user.accountStatus !== "pending") {
    return <p className="text-sm font-extrabold text-muted sm:text-right">Sudah diproses</p>;
  }

  return (
    <div className="flex flex-wrap gap-2 sm:justify-end">
      <IconActionButton label={`Setujui ${user.fullName}`} tone="primary" disabled={processingId === user.id} onClick={() => onApprove(user)}><CheckCircle2 size={17} /></IconActionButton>
      <IconActionButton label={`Tolak ${user.fullName}`} tone="danger" disabled={processingId === user.id} onClick={() => onReject(user)}><XCircle size={17} /></IconActionButton>
    </div>
  );
}

function ApprovalSkeleton() {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="px-6 py-5">
          <div className="h-6 w-52 animate-pulse rounded-xl bg-line/70" />
          <div className="mt-3 h-4 w-72 max-w-full animate-pulse rounded-xl bg-line/60" />
        </div>
      ))}
    </div>
  );
}

function RejectApprovalModal({ user, loading, onClose, onSubmit }: { readonly user: User | null; readonly loading: boolean; readonly onClose: () => void; readonly onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState("");

  return (
    <Modal isOpen={Boolean(user)} title="Tolak Pengajuan Admin" onClose={onClose}>
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(reason.trim());
        }}
      >
        <label className="block text-sm font-extrabold text-text-main" htmlFor="rejectReason">Alasan Penolakan</label>
        <textarea
          id="rejectReason"
          name="reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={4}
          className="w-full resize-none rounded-2xl border border-line bg-white px-4 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary"
          placeholder="Isi alasan penolakan."
        />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="submit" icon={<XCircle size={16} />} loading={loading}>Tolak Pengajuan</Button>
        </div>
      </form>
    </Modal>
  );
}
