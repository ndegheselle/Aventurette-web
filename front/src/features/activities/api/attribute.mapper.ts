import type {
    ActivityAttributeOptionsResponse,
    ActivityAttributeValuesResponse,
    AttributeDefinitionsResponse,
    AttributeOptionsResponse,
    GroupsResponse,
} from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import type {
    ActivityAttributeOptionData,
    ActivityAttributeValueData,
    AttributeDefinitionData,
    AttributeOptionData,
    GroupData,
} from "@features/activities/model/attribute";

/**
 * The catalogue's five collections are flat: every relation on them is an id the app looks up
 * in a list it already holds, so each mapper only has `expand` to drop. The join between a
 * definition and its options is the model's — see `attributesWithOptions`.
 */

export type GroupPayload = GroupsResponse;

export const groupMapper: EntityMapper<GroupPayload, GroupData> = {
    relations: [],
    toEntity: ({ expand: _expand, ...group }) => group,
    toPayload: (group) => group,
};

export type AttributeDefinitionPayload = AttributeDefinitionsResponse;

export const attributeDefinitionMapper: EntityMapper<AttributeDefinitionPayload, AttributeDefinitionData> = {
    relations: [],
    toEntity: ({ expand: _expand, ...definition }) => definition,
    toPayload: (definition) => definition,
};

export type AttributeOptionPayload = AttributeOptionsResponse;

export const attributeOptionMapper: EntityMapper<AttributeOptionPayload, AttributeOptionData> = {
    relations: [],
    toEntity: ({ expand: _expand, ...option }) => option,
    toPayload: (option) => option,
};

export type ActivityAttributeValuePayload = ActivityAttributeValuesResponse;

export const activityAttributeValueMapper: EntityMapper<ActivityAttributeValuePayload, ActivityAttributeValueData> = {
    relations: [],
    toEntity: ({ expand: _expand, ...value }) => value,
    toPayload: (value) => value,
};

export type ActivityAttributeOptionPayload = ActivityAttributeOptionsResponse;

export const activityAttributeOptionMapper: EntityMapper<ActivityAttributeOptionPayload, ActivityAttributeOptionData> = {
    relations: [],
    toEntity: ({ expand: _expand, ...pick }) => pick,
    toPayload: (pick) => pick,
};
