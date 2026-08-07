import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import type { InterestData } from "@features/users/model/interest";

export const interestsRepository = crud<InterestData>(Collections.Interests);
