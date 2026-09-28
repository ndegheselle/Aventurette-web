<script setup lang="ts" generic="T extends BaseEntity & { name: string }">
import type { BaseEntity } from '@chapelure/core';
import Field from '@chapelure/ui/forms/Field.vue';
import TagSelect from '@chapelure/ui/inputs/TagSelect.vue';
import { pickedAmong } from '@features/activities-authoring/model/activity.edit';

/**
 * Links records that already exist — tags, or the activity's materials — by picking among
 * `items`. `label` is a translation key.
 */
const { items, label, error } = defineProps<{
    items: T[];
    label: string;
    error?: string;
}>();

const selected = defineModel<T[]>({ default: () => [] });
</script>

<template>
    <Field :label :error>
        <TagSelect :items displayKey="name"
            :modelValue="pickedAmong(items, selected)" @update:modelValue="picked => selected = picked" />
    </Field>
</template>
