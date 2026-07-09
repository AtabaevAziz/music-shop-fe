import { api, unwrapListPayload } from "@/lib/api-client";
import { fromApiActivity } from "@/services/activity/activity-mapper";
import type {
  ActivityListQuery,
  ApiActivity,
} from "@/services/activity/activity-types";

export async function getActivity(query: ActivityListQuery = {}) {
  const response = await api.get<{ items: ApiActivity[] } | ApiActivity[]>(
    "activity",
    { params: query },
  );
  return unwrapListPayload(response).map(fromApiActivity);
}
