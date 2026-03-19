<script setup lang="ts">
import { PlusIcon } from 'lucide-vue-next';
import { useTemplateRef } from 'vue';
const modalRef = useTemplateRef('modal');

</script>

<template>
    <div class="container mx-auto flex flex-col my-2">
        <div class="bg-base-200 rounded-box">
            <svg viewBox="0 0 100 100" width="80px">
                <circle cx="50" cy="50" r="30" />
                <rect width="100" height="50" x="0" y="50" ry="20" />
            </svg>
        </div>
        <button class="btn btn-primary mt-1">
            <PlusIcon />
            {{ $t("actions.add") }}
        </button>
    </div>
</template>