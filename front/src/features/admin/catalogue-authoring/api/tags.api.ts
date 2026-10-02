import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { tagMapper } from "@features/activities/api/tag.mapper";

// The tags every activity picks from. The backend refuses a slug its kind already has, and
// unlinks a deleted tag from every activity carrying it.
export const tagsApi = crud(Collections.CatalogTags, tagMapper);
