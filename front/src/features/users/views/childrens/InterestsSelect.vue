<script setup lang="ts">
import { interests, type InterestData } from '@features/users/data/interests';
import { onMounted, ref, watch } from 'vue';

const props = defineProps<{ selected?: string[] }>();
const emit = defineEmits<{ (e: 'update:selected', value: string[]): void }>();

const list = ref<(InterestData & { isSelected: boolean })[]>([]);

onMounted(async () => {
    const data = await interests.getAll();
    list.value = data.map(item => ({ ...item, isSelected: false }));
});

const applySelected = () => {
    if (props.selected) {
        list.value = list.value.map(item => ({
            ...item,
            isSelected: props.selected!.includes(item.id),
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
    emit('update:selected', list.value.filter(i => i.isSelected).map(x => x.id));
};
</script>

<template>
    <div>
        <label class="label text-sm">
            <span class="label-text">{{ $t('childrens.interests.title') }}</span>
        </label>
        <div class="flex flex-wrap gap-1">
            <span v-for="interest in list" :key="interest.id" class="badge cursor-pointer"
                :class="interest.isSelected ? 'badge-primary' : ''" @click="toggle(interest)">
                {{ interest.name }}
            </span>
        </div>
    </div>
</template>