<!-- What an activity or a step uses — materials, then resources — as square tiles on one scrolling
     line: a picture on top, the name and its quantity centred below it. The text area has one
     height for every tile, so the pictures line up whether a quantity is there or not. Nothing has
     a picture of its own yet but an image resource, so the rest show an icon in its place. -->
<script setup lang="ts">
import ResponsiveModal from '@chapelure/ui/modals/ResponsiveModal.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import { Button } from '@chapelure/ui/shadcn/button';
import type { ActivityMaterialData } from '@features/activities/models/material';
import { pictureOf, type ActivityResourceData } from '@features/activities/models/step';
import { ExternalLinkIcon, FileTextIcon, PackageIcon } from 'lucide-vue-next';
import { ref } from 'vue';

defineProps<{
    materials: ActivityMaterialData[];
    resources: ActivityResourceData[];
}>();

const sheet = useModal();
const material = ref<ActivityMaterialData>();
const resource = ref<ActivityResourceData>();

function showMaterial(picked: ActivityMaterialData) {
    material.value = picked;
    resource.value = undefined;
    sheet.show();
}

function showResource(picked: ActivityResourceData) {
    resource.value = picked;
    material.value = undefined;
    sheet.show();
}
</script>

<template>
    <div v-if="materials.length || resources.length"
         class="flex w-full snap-x snap-mandatory justify-center gap-2 overflow-x-auto">
        <button v-for="item in materials"
                :key="item.id"
                type="button"
                :title="item.name"
                class="flex w-20 shrink-0 snap-start flex-col justify-center cursor-pointer"
                @click="() => showMaterial(item)">
            <div class="flex items-center justify-center bg-muted rounded-xl size-20">
                <PackageIcon class="size-10 text-muted-foreground" />
            </div>
            <div class="flex flex-col justify-center text-sm text-center">
                <div class="truncate">{{ item.name }}</div>
                <div v-if="item.quantity"
                     class="truncate text-xs text-muted-foreground">{{ item.quantity }}</div>
            </div>
        </button>

        <button v-for="item in resources"
                :key="item.id"
                type="button"
                :title="item.name"
                class="flex w-20 shrink-0 snap-start flex-col cursor-pointer"
                @click="() => showResource(item)">
            <img v-if="pictureOf(item)"
                 :src="pictureOf(item)"
                 alt=""
                 class="flex-1 min-h-0 w-full object-cover" />
            <div v-else
                 class="flex items-center justify-center bg-muted rounded-xl size-20">
                <FileTextIcon class="size-10 text-muted-foreground" />
            </div>
            <div class="flex flex-col justify-center text-sm text-center">
                <div class="truncate">{{ item.name }}</div>
            </div>
        </button>

        <ResponsiveModal :controller="sheet">
            <template #title>{{ material?.name ?? resource?.name }}</template>
            <div v-if="material" class="flex flex-col items-center gap-3">
                <div class="flex items-center justify-center bg-muted rounded-xl size-32">
                    <PackageIcon class="size-16 text-muted-foreground" />
                </div>
                <div v-if="material.quantity" class="text-center">
                    <div class="text-xs text-muted-foreground">{{ $t('activities.materials.quantity') }}</div>
                    <div>{{ material.quantity }}</div>
                </div>
            </div>
            <div v-else-if="resource" class="flex flex-col items-center gap-3">
                <img v-if="pictureOf(resource)"
                     :src="pictureOf(resource)"
                     alt=""
                     class="max-h-80 rounded-xl object-contain" />
                <div v-else
                     class="flex items-center justify-center bg-muted rounded-xl size-32">
                    <FileTextIcon class="size-16 text-muted-foreground" />
                </div>
                <Button as-child>
                    <a :href="resource.url"
                       target="_blank"
                       rel="noopener">
                        <ExternalLinkIcon />
                        {{ $t('activities.supplies.open') }}
                    </a>
                </Button>
            </div>
        </ResponsiveModal>
    </div>
</template>
