<script setup lang="ts">
import Field from '@chapelure/ui/forms/Field.vue';
import { interestsApi as interests } from '@features/users/api/interests.api';
import {
    selectionOf,
    withSelection,
    type InterestData,
    type SelectableInterest,
} from '@features/users/model/interest';
import { onMounted, ref, watch } from 'vue';

// Whole interests, not ids — the shape the child record holds and is saved back in.
const props = defineProps<{ selected?: InterestData[] }>();
const emit = defineEmits<{ (e: 'update:selected', value: InterestData[]): void }>();

const available = ref<InterestData[]>([]);
const list = ref<SelectableInterest[]>([]);

onMounted(async () => {
    available.value = await interests.getAll();
    list.value = withSelection(available.value, props.selected);
});

// Re-mark whenever the child being edited changes under us.
watch(() => props.selected, () => {
    list.value = withSelection(available.value, props.selected);
});

function toggle(interest: SelectableInterest) {
    interest.isSelected = !interest.isSelected;
    emit('update:selected', selectionOf(list.value));
}
</script>

<template>
    <Field label="children.interests.title">
        <div class="flex flex-wrap gap-1">
            <span v-for="interest in list"
                  :key="interest.id"
                  class="badge cursor-pointer"
                  :class="{ 'badge-primary': interest.isSelected }"
                  @click="toggle(interest)">
                {{ interest.name }}
            </span>
        </div>
    </Field>
</template>
