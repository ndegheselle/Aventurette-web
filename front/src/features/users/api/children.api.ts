import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { childMapper } from "@features/users/model/child";

export const childrenApi = crud(Collections.Childrens, childMapper);
