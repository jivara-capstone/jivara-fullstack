import api from "@/lib/axios";

interface ActivityReadResponse {
  activityId: string;
  readAt?: string | null;
}

interface ActivityReadListResponse {
  data: ActivityReadResponse[];
}

export const getActivityReadIdsFromApi = async () => {
  const response = await api.get<ActivityReadListResponse>("/activity-reads");
  return new Set(response.data.data.map((read) => read.activityId));
};

export const markActivitiesReadViaApi = async (activityIds: readonly string[]) => {
  if (activityIds.length === 0) return;
  await api.post("/activity-reads", { activityIds });
};
