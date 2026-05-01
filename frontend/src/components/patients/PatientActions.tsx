import { Edit3, Eye, Trash2 } from "lucide-react";

export type PatientAction = "view" | "edit" | "delete";

interface PatientActionsProps {
  readonly patientName: string;
  readonly actions?: readonly PatientAction[];
}

const actionConfig = {
  view: { label: "Lihat detail", icon: Eye, className: "hover:bg-primary/10 hover:text-primary" },
  edit: { label: "Edit", icon: Edit3, className: "hover:bg-warning/10 hover:text-warning" },
  delete: { label: "Hapus", icon: Trash2, className: "hover:bg-danger/10 hover:text-danger" },
} as const;

export default function PatientActions({ patientName, actions = ["view"] }: PatientActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {actions.map((action) => {
        const config = actionConfig[action];
        const Icon = config.icon;

        return (
          <button
            key={action}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors ${config.className}`}
            aria-label={`${config.label} ${patientName}`}
          >
            <Icon size={17} />
          </button>
        );
      })}
    </div>
  );
}
