import type { Messages } from "@/app/i18n";
import type {
    ActivitiesFieldsResponse,
    ActivitiesSecurityResponse,
} from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";

/** A referential row. The eight plain ones are this; Sécurité carries two fields more. */
export type ReferentialData = Entity<ActivitiesFieldsResponse<Messages>>;

/**
 * A safety tag. `slug` is what the safety referential names it by — the one referential whose
 * rows are referred to by something other than their wording.
 */
export type SecurityTagData = Entity<ActivitiesSecurityResponse<Messages, Messages>>;