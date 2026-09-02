<script setup lang="ts">
import { interestsApi as interests } from '@features/users/api/interests.api';
import Field from '@chapelure/ui/forms/Field.vue';
import { type InterestData } from '@features/users/model/interest';
import { onMounted, ref, watch } from 'vue';

// `selected` carries whole interests, not ids: that is the shape the child record now holds,
// and the shape it is saved back in.
const props = defineProps<{ selected?: InterestData[] }>();
const emit = defineEmits<{ (e: 'update:selected', value: InterestData[]): void }>();
const list = ref<(InterestData & { isSelected: boolean })[]>([]);

onMounted(async () => {
    const data = await interests.getAll();
    list.value = data.map(item => ({ ...item, isSelected: false }));
    applySelected();
});

const applySelected = () => {
    if (props.selected) {
        const selectedIds = new Set(props.selected.map(item => item.id));
        list.value = list.value.map(item => ({
            ...item,
            isSelected: selectedIds.has(item.id),
        }));
    }
};

watch(
    () => props.selected,
    () => {
        applySelected();
    },
    { immediate: true }
);

const toggle = (interest: InterestData & { isSelected: boolean }) => {
    interest.isSelected = !interest.isSelected;
    emit('update:selected', list.value
        .filter(i => i.isSelected)
        .map(({ isSelected, ...item }) => item));
};
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
