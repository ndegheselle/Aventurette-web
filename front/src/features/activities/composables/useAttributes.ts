import {
    attributeDefinitionsApi as definitions,
    attributeOptionsApi as options,
    groupsApi as groups,
} from '@features/activities/api/attributes.api';
import { attributesWithOptions, type AttributeData, type GroupData } from '@features/activities/model/attribute';
import { onMounted, ref } from 'vue';

/**
 * The attribute catalogue, as every screen that shows or edits an activity needs it: the groups
 * and the attributes with their vocabularies joined on.
 *
 * Reading it costs three requests the first time and nothing after — the three collections are
 * `cachedCrud`, so several components asking at once still fetch once.
 */
export function useAttributes() {
    const available = ref<GroupData[]>([]);
    const attributes = ref<AttributeData[]>([]);

    onMounted(async () => {
        const [loadedGroups, loadedDefinitions, loadedOptions] = await Promise.all([
            groups.getAll(),
            definitions.getAll(),
            options.getAll(),
        ]);

        available.value = loadedGroups;
        attributes.value = attributesWithOptions(loadedDefinitions, loadedOptions, loadedGroups);
    });

    return { groups: available, attributes };
}
