<!-- What an activity or a step uses — materials, then resources — as square tiles on one scrolling
     line: a picture on top, the name and its quantity centred below it. Nothing has a picture of
     its own yet but an image resource, so the rest show an icon in its place. -->
<script setup lang="ts">
import type { ActivityMaterialData } from '@features/activities/models/material';
import { pictureOf, type ActivityResourceData } from '@features/activities/models/step';
import { FileTextIcon, PackageIcon } from 'lucide-vue-next';

defineProps<{
    materials: ActivityMaterialData[];
    resources: ActivityResourceData[];
}>();
</script>

<template>
    <div v-if="materials.length || resources.length" class="carousel w-full gap-2">
        <div v-for="material in materials" :key="material.id" :title="material.name"
             class="carousel-item flex-col size-36 rounded-box overflow-hidden bg-base-200">
            <div class="flex-1 min-h-0 flex items-center justify-center bg-base-300">
                <PackageIcon class="size-10 opacity-30" />
            </div>
            <div class="p-2 text-sm text-center">
                <div class="truncate">{{ material.name }}</div>
                <div v-if="material.quantity" class="truncate text-xs opacity-60">{{ material.quantity }}</div>
            </div>
        </div>

        <a v-for="resource in resources" :key="resource.id" :title="resource.name" :href="resource.url"
           target="_blank" rel="noopener"
           class="carousel-item flex-col size-36 rounded-box overflow-hidden bg-base-200">
            <img v-if="pictureOf(resource)" :src="pictureOf(resource)" alt=""
                 class="flex-1 min-h-0 w-full object-cover" />
            <div v-else class="flex-1 min-h-0 flex items-center justify-center bg-base-300">
                <FileTextIcon class="size-10 opacity-30" />
            </div>
            <div class="p-2 text-sm text-center truncate">{{ resource.name }}</div>
        </a>
    </div>
</template>
