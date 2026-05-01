"use client";

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/axios';
import { DashboardLayout } from '@/components/dashboard';
import { PatientTable } from '@/components/patients';
import SummaryCard from '@/components/ui/SummaryCard';
import { dashboardStats, recentPatients } from '@/lib/mocks/dashboard';

export default function DashboardPage() {
  const { user, setAuth, token, refreshToken } = useAuthStore();
  const [profileLoadFailed, setProfileLoadFailed] = useState(false);
  const isLoadingUser = Boolean(token && !user && !profileLoadFailed);

  useEffect(() => {
    if (!isLoadingUser) {
      return;
    }

    const fetchUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (token && refreshToken) {
          setAuth(data.data, token, refreshToken);
        }
      } catch {
        // Auth middleware handles invalid sessions; keep dashboard from flashing a loader loop.
        setProfileLoadFailed(true);
      }
    };

    fetchUser();
  }, [isLoadingUser, setAuth, token, refreshToken]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-5">
        <p className="text-gray-500 font-medium">Memuat data pengguna...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout>
      <motion.main
        className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:ml-[280px] lg:w-[calc(100%-280px)] lg:max-w-none lg:px-10 lg:py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.section
          id="overview"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="font-display text-3xl font-extrabold tracking-[-0.04em] text-text-main sm:text-4xl">
            Ringkasan Pasien
          </h1>
        </motion.section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {dashboardStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.08 + index * 0.08 }}
            >
              <SummaryCard stat={stat} />
            </motion.div>
          ))}
        </section>

        <motion.div
          className="mt-6"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        >
          <PatientTable patients={recentPatients.slice(0, 5)} title="Pasien Terbaru" showViewAll actions={["view"]} />
        </motion.div>
      </motion.main>
    </DashboardLayout>
  );
}
