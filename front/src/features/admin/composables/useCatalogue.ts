import { useAttributes } from '@features/activities/composables/useAttributes';
import { catalogueOf, optionCount } from '@features/admin/model/catalogue';
import { computed } from 'vue';

/**
 * The attribute catalogue, grouped for the administration screen. Read-only: this screen shows
 * what the seed and the Dashboard put there, and nothing here writes.
 */
export function useCatalogue() {
    const { groups, attributes } = useAttributes();

    return {
        catalogue: computed(() => catalogueOf(groups.value, attributes.value)),
        attributes,
        options: computed(() => optionCount(attributes.value)),
    };
}
