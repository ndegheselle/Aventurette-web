import type { ActivitiesMaterialsResponse, CatalogMaterialsResponse } from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";

/**
 * A material of the catalogue every activity picks from. A name, and nothing an activity
 * decides: how much of it one needs is on the activity's own link to it.
 */
export type MaterialData = Entity<CatalogMaterialsResponse>;

/**
 * Something the activity needs, with how much of it: the activity's link to a catalogue
 * material. `material` is the catalogue row's id and `name` its name, carried along so a list
 * of them reads as one. The activity's steps and workshops recall these links, not the catalogue.
 */
export type ActivityMaterialData = Entity<ActivitiesMaterialsResponse, {
    /** The catalogue material's name. Read only: renaming is the catalogue's business. */
    name: string;
}>;
