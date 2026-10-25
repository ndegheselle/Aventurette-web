<!-- What the planning shows when the dates on screen hold no plan: a way to add one. -->
<script setup lang="ts">
import { CalendarPlusIcon } from 'lucide-vue-next';

defineEmits<{
    add: [];
}>();
</script>

<template>
    <div class="flex flex-col items-center gap-4 p-8 text-center">
        <CalendarPlusIcon class="size-10 opacity-70" />
        <p class="opacity-70">{{ $t('planning.empty') }}</p>
        <button type="button" class="btn btn-primary" @click="$emit('add')">
            <CalendarPlusIcon />
            {{ $t('planning.actions.add') }}
        </button>
    </div>
</template>
