import { create } from "zustand";
import { activityLogs } from "@/lib/mocks/activityLogs";
import type { ActivityLogRecord } from "@/lib/mocks/activityLogs";
import { TEMP_ADMIN_TEST_MODE } from "@/lib/tempAdminTestMode";

interface ActivityLogState {
  readonly activities: ActivityLogRecord[];
  readonly setActivities: (activities: ActivityLogRecord[]) => void;
  readonly addActivity: (activity: ActivityLogRecord) => void;
  readonly markAsRead: (activityId: string) => void;
  readonly markAllAsRead: () => void;
}

export const useActivityLogStore = create<ActivityLogState>()((set) => ({
  activities: TEMP_ADMIN_TEST_MODE ? activityLogs : [],
  setActivities: (activities) => set({ activities }),
  addActivity: (activity) => set((state) => ({
    activities: [activity, ...state.activities],
  })),
  markAsRead: (activityId) => set((state) => ({
    activities: state.activities.map((activity) => activity.id === activityId ? { ...activity, read: true } : activity),
  })),
  markAllAsRead: () => set((state) => ({
    activities: state.activities.map((activity) => ({ ...activity, read: true })),
  })),
}));
