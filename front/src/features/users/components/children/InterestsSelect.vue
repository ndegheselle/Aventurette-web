<script setup lang="ts">
import { interestsRepository as interests } from '@features/users/data/interests.repository';
import Field from '@chapelure/ui/forms/Field.vue';
import Badge from '@chapelure/ui/primitives/Badge.vue';
import { type InterestData } from '@features/users/model/interest';
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
    <Field label="children.interests.title">
        <div class="flex flex-wrap gap-1">
            <Badge v-for="interest in list"
                   :key="interest.id"
                   :variant="interest.isSelected ? 'primary' : 'default'"
                   class="cursor-pointer"
                   @click="toggle(interest)">
                {{ interest.name }}
            </Badge>
        </div>
    </Field>
</template>
