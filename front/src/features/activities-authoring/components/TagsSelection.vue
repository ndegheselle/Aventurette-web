<script setup lang="ts">
import Field from '@chapelure/ui/forms/Field.vue';
import TagSelect from '@chapelure/ui/inputs/TagSelect.vue';
import { useActivityTags } from '@features/activities-authoring/composables/useActivityEdit';
import type { ActivityTagData } from '@features/activities/model/tag';

const selected = defineModel<ActivityTagData[]>({ default: () => [] });

const { groups, pickedOf, pick } = useActivityTags(selected);
</script>

<template>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
        <Field v-for="group in groups" :key="group.type" :label="`activities.tagType.${group.type}`">
            <TagSelect :items="group.tags" displayKey="name"
                :modelValue="pickedOf(group)" @update:modelValue="picked => pick(group, picked)" />
        </Field>
    </div>
</template>
