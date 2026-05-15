import app from "./app";
import { startMedicationReminderScheduler } from "./services/medication-reminder-scheduler.service";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  startMedicationReminderScheduler();
  // console.log(`[server]: Server berjalan di http://localhost:${PORT}`);
});
