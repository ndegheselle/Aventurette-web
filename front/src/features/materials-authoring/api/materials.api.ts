import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { materialMapper } from "@features/activities/api/material.mapper";

// The catalogue every activity picks its materials from. The backend refuses a name it already
// has, whatever its case. Deleting a material cascades to the activities' links to it: it leaves
// every activity that listed it, and every step and workshop that recalled it.
export const materialsApi = crud(Collections.Materials, materialMapper);
