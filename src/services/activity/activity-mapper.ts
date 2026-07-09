import type { ApiActivity } from "@/services/activity/activity-types";
import type { Activity } from "@/types/music";

export function fromApiActivity(activity: ApiActivity): Activity {
  return activity;
}
