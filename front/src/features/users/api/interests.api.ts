import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { interestMapper } from "@features/users/model/interest";

export const interestsApi = crud(Collections.Interests, interestMapper);
