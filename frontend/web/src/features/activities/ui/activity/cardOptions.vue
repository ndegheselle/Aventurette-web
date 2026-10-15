<!-- One instance per list: <ActivityCardOptions ref="options" />, then options.value?.show(title). -->
<script setup lang="ts">
import BottomSheet from '@chapelure/ui/modals/BottomSheet.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import { ref } from 'vue';

const sheet = useModal();
const title = ref('');

function show(activityTitle: string) {
    title.value = activityTitle;
    return sheet.show();
}

defineExpose({ show });
</script>

<template>
    <BottomSheet :controller="sheet">
        <template #title>{{ title }}</template>
        <!-- The actions on an activity go here. -->
    </BottomSheet>
</template>
