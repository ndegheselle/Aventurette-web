<script setup lang="ts">
import TagSelect from '@chapelure/ui/data/TagSelect.vue';
import Field from '@chapelure/ui/forms/Field.vue';
import { attributeIcon } from '@features/activities/composables/attributeIcons';
import { AttributeType, type AttributeOptionData } from '@features/activities/model/attribute';
import type { AttributeDraft } from '@features/activities-authoring/model/attribute.edit';
import { computed } from 'vue';

/**
 * One attribute of the edit form; the attribute's type picks the input. Hand it a draft: the
 * inputs write into it directly, and the save reads the drafts back.
 *
 * Nothing here knows which attributes exist — a new one in the catalogue gets a field without
 * this file or its page changing.
 */
const { draft } = defineProps<{ draft: AttributeDraft }>();

const icon = computed(() => attributeIcon(draft.attribute.slug));

/** TagSelect binds the options themselves; a draft holds their ids. */
const picked = computed<AttributeOptionData[]>({
    get: () => draft.attribute.options.filter(option => draft.options.includes(option.id)),
    set: (options) => { draft.options = options.map(option => option.id); },
});
</script>

<template>
    <Field>
        <template #label>
            <span class="flex items-center gap-1">
                <component :is="icon" class="icon-sm" /> {{ draft.attribute.name }}
            </span>
        </template>

        <div v-if="draft.attribute.type === AttributeType.range" class="grid grid-cols-2 gap-2">
            <div>
                <span class="text-sm opacity-50">{{ $t('data.minimum') }}</span>
                <input type="number" class="input w-full" min="0" v-model.number="draft.min" />
            </div>
            <div>
                <span class="text-sm opacity-50">{{ $t('data.maximum') }}</span>
                <input type="number" class="input w-full" min="0" v-model.number="draft.max" />
            </div>
        </div>

        <input v-else-if="draft.attribute.type === AttributeType.number" type="number" class="input w-full" min="0"
            v-model.number="draft.number" />

        <select v-else-if="draft.attribute.type === AttributeType.single_choice" class="select w-full"
            v-model="draft.option">
            <option value="">{{ $t('data.none') }}</option>
            <option v-for="option in draft.attribute.options" :key="option.id" :value="option.id">
                {{ option.label }}
            </option>
        </select>

        <TagSelect v-else-if="draft.attribute.type === AttributeType.multi_choice"
            :items="draft.attribute.options" display-key="label" v-model="picked" />

        <input v-else type="text" class="input w-full" v-model="draft.text" />
    </Field>
</template>
