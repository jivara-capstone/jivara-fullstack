import { count } from "drizzle-orm";
import { db } from "../db";
import { nurses, patients } from "../db/schema";
import { getCached, setCached } from "./cache.service";

const PUBLIC_STATS_CACHE_TTL_MS = Number(process.env.PUBLIC_STATS_CACHE_TTL_MS || 60_000);

export const getPublicStats = async () => {
  const cached = getCached("public-stats");
  if (cached) return cached;

  const [nurseRows, patientRows] = await Promise.all([
    db.select({ total: count() }).from(nurses),
    db.select({ total: count() }).from(patients),
  ]);

  const result = {
    totalNurses: nurseRows[0]?.total || 0,
    totalPatients: patientRows[0]?.total || 0,
  };

  setCached("public-stats", result, PUBLIC_STATS_CACHE_TTL_MS);
  return result;
};
