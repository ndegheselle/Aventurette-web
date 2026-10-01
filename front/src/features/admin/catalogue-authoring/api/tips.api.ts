import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { tipMapper } from "@features/activities/api/tip.mapper";

// The tips every activity picks from. The backend unlinks a deleted tip from every activity
// giving it.
export const tipsApi = crud(Collections.CatalogTips, tipMapper);
