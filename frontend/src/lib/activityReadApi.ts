import api from "@/lib/axios";

interface ActivityReadResponse {
  activityId: string;
  readAt?: string | null;
}

interface ActivityReadListResponse {
  data: ActivityReadResponse[];
}

const activityReadCacheTtl = 30_000;
let activityReadCache: { data: Set<string>; expiresAt: number } | null = null;
let activityReadRequest: Promise<Set<string>> | null = null;

export const clearActivityReadCache = () => {
  activityReadCache = null;
  activityReadRequest = null;
};

export const getActivityReadIdsFromApi = async () => {
  const now = Date.now();
  if (activityReadCache && activityReadCache.expiresAt > now) return activityReadCache.data;
  if (activityReadRequest) return activityReadRequest;

  activityReadRequest = api.get<ActivityReadListResponse>("/activity-reads")
    .then((response) => {
      const readIds = new Set(response.data.data.map((read) => read.activityId));
      activityReadCache = { data: readIds, expiresAt: Date.now() + activityReadCacheTtl };
      return readIds;
    })
    .finally(() => {
      activityReadRequest = null;
    });

  return activityReadRequest;
};

export const markActivitiesReadViaApi = async (activityIds: readonly string[]) => {
  if (activityIds.length === 0) return;
  await api.post("/activity-reads", { activityIds });
  clearActivityReadCache();
};
