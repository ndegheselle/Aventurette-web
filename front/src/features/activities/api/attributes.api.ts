import { cachedCrud, crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import {
    activityAttributeOptionMapper,
    activityAttributeValueMapper,
    attributeDefinitionMapper,
    attributeOptionMapper,
    groupMapper,
} from "@features/activities/api/attribute.mapper";

// The catalogue changes when someone edits the Glossaire, not while a screen is open: fetched
// once, then served from memory.
export const groupsApi = cachedCrud(Collections.Groups, groupMapper);
export const attributeDefinitionsApi = cachedCrud(Collections.AttributeDefinitions, attributeDefinitionMapper);
export const attributeOptionsApi = cachedCrud(Collections.AttributeOptions, attributeOptionMapper);

// What activities hold, on the other hand, is written from the editor and read back per screen.
export const activityAttributeValuesApi = crud(Collections.ActivityAttributeValues, activityAttributeValueMapper);
export const activityAttributeOptionsApi = crud(Collections.ActivityAttributeOptions, activityAttributeOptionMapper);
