import type { Messages } from "@/app/i18n";
import type {
    ActivitiesFieldsResponse,
    ActivitiesSecurityResponse,
} from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import type {
    ReferentialData,
    SecurityTagData,
} from "@features/activities/model/referential";

/**
 * The referentials are flat: nothing hangs off a row, so each mapper has only `expand` to drop.
 * A wording arrives as the JSON object it is stored as — picking a locale out of it is the
 * model's, not this layer's.
 */

export type ReferentialPayload = ActivitiesFieldsResponse<Messages>;

export const referentialMapper: EntityMapper<ReferentialPayload, ReferentialData> = {
    relations: [],
    toEntity: ({ expand: _expand, ...row }) => row,
    toPayload: (row) => row,
};

export type SecurityTagPayload = ActivitiesSecurityResponse<Messages, Messages>;

export const securityTagMapper: EntityMapper<SecurityTagPayload, SecurityTagData> = {
    relations: [],
    toEntity: ({ expand: _expand, ...tag }) => tag,
    toPayload: (tag) => tag,
};
