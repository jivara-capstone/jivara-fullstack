import { db } from "../db";
import { activityReads } from "../db/schema";
import { and, eq, inArray } from "drizzle-orm";

const cleanActivityIds = (activityIds: unknown) => Array.isArray(activityIds)
  ? [...new Set(activityIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0).map((id) => id.slice(0, 128)))]
  : [];

export const listActivityReads = async (userId: string) => {
  const rows = await db
    .select({ activityId: activityReads.activityId, readAt: activityReads.readAt })
    .from(activityReads)
    .where(eq(activityReads.userId, userId));

  return rows;
};

export const markActivitiesRead = async (userId: string, rawActivityIds: unknown) => {
  const activityIds = cleanActivityIds(rawActivityIds);
  if (activityIds.length === 0) return [];

  await db
    .insert(activityReads)
    .values(activityIds.map((activityId) => ({ userId, activityId })))
    .onConflictDoNothing();

  return db
    .select({ activityId: activityReads.activityId, readAt: activityReads.readAt })
    .from(activityReads)
    .where(and(eq(activityReads.userId, userId), inArray(activityReads.activityId, activityIds)));
};
