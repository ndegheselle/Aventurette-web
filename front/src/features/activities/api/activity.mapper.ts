import type { ActivitiesResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import {
    activityAttributeOptionMapper,
    activityAttributeValueMapper,
    groupMapper,
    type ActivityAttributeOptionPayload,
    type ActivityAttributeValuePayload,
    type GroupPayload,
} from "@features/activities/api/attribute.mapper";
import { stepMapper, type ActivityStepPayload } from "@features/activities/api/step.mapper";
import type { ActivityData } from "@features/activities/model/activity";

/**
 * The two back-relations an activity reads its attributes through. A value row points at the
 * activity rather than the other way round, so PocketBase names the expand after the pointing
 * field — `<collection>_via_<field>`.
 */
const VALUES_VIA_ACTIVITY = "activity_attribute_values_via_activity";
const PICKS_VIA_ACTIVITY = "activity_attribute_options_via_activity";

/** An activity as the backend stores it, with what an expanded read carries alongside. */
export type ActivityPayload = ActivitiesResponse<{
    groups?: GroupPayload[];
    steps?: ActivityStepPayload[];
    [VALUES_VIA_ACTIVITY]?: ActivityAttributeValuePayload[];
    [PICKS_VIA_ACTIVITY]?: ActivityAttributeOptionPayload[];
}>;

/**
 * Reads and writes an activity: groups and steps arrive as records — their own mappers' work —
 * and go back as ids, because saving an activity persists its links and nothing under them.
 *
 * The attribute rows go back nowhere at all. They are not fields of `activities`, so `toPayload`
 * drops them and the editor writes them through their own collections.
 */
export const activityMapper: EntityMapper<ActivityPayload, ActivityData> = {
    relations: [
        "groups",
        "steps",
        ...stepMapper.relations.map(relation => `steps.${relation}`),
        VALUES_VIA_ACTIVITY,
        PICKS_VIA_ACTIVITY,
    ],
    toEntity: ({ expand, ...activity }, files) => ({
        ...activity,
        groups: (expand?.groups ?? []).map(group => groupMapper.toEntity(group, files)),
        steps: (expand?.steps ?? []).map(step => stepMapper.toEntity(step, files)),
        attributes: (expand?.[VALUES_VIA_ACTIVITY] ?? [])
            .map(value => activityAttributeValueMapper.toEntity(value, files)),
        picks: (expand?.[PICKS_VIA_ACTIVITY] ?? [])
            .map(pick => activityAttributeOptionMapper.toEntity(pick, files)),
    }),
    toPayload: ({ groups, steps, attributes: _attributes, picks: _picks, ...activity }) => ({
        ...activity,
        ...(groups && { groups: groups.map(group => group.id) }),
        ...(steps && { steps: steps.map(step => step.id) }),
    }),
};
