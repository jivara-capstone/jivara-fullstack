import type { Metadata } from "next";
import { AuthPageShell, RegisterForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Buat akun admin Jivara. Akun baru akan aktif setelah disetujui oleh Super Admin.",
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return (
    <AuthPageShell>
      <RegisterForm />
    </AuthPageShell>
  );
}
