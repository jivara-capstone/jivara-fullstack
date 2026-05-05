"use client";

import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import Button from "@/components/ui/Button";
import { showToast } from "@/lib/swal";
import ToggleRow from "./ToggleRow";

export default function PatientReminderSettingsForm() {
  const [medicineReminder, setMedicineReminder] = useState(true);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    showToast("Preferensi reminder obat berhasil disimpan.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <ToggleRow
        id="medicineReminder"
        title="Reminder minum obat"
        description="Aktifkan notifikasi sesuai jadwal obat dan aturan sebelum/sesudah makan."
        checked={medicineReminder}
        onChange={setMedicineReminder}
      />
      <div className="flex justify-end pt-2">
        <Button type="submit" icon={<Save size={18} />}>Simpan</Button>
      </div>
    </form>
  );
}
