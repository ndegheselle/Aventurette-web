<script setup lang="ts">
import FilesInput from '@chapelure/ui/files/FilesInput.vue';
import { Button } from '@chapelure/ui/shadcn/button';
import { Input } from '@chapelure/ui/shadcn/input';
import type { ActivityResourceData } from '@features/activities/models/step';
import { useStepResources } from '@features/activities-authoring/composables/useStepResources';
import { ACCEPTED_RESOURCE_TYPES, resourcePreviewOf } from '@features/activities-authoring/models/step.edit';
import { CircleOffIcon, FileIcon, FileTextIcon, TrashIcon } from 'lucide-vue-next';

/** A picked file is stored against this step when the activity is saved. */
const props = defineProps<{ stepId: string }>();

/** Stored resources, and picked ones carrying their file until the save uploads it. */
const selected = defineModel<ActivityResourceData[]>({ default: () => [] });

const { add, remove } = useStepResources(selected, () => props.stepId);
</script>

<template>
    <FilesInput :accept="ACCEPTED_RESOURCE_TYPES" multiple @change="add">
        <template #constraints>
            {{ $t('activities.steps.fields.resources.constraints') }}
        </template>
    </FilesInput>
    <div class="flex flex-wrap mt-1 bg-muted rounded-xl pt-1">
        <div v-for="(resource, index) in selected" :key="resource.id" class="relative text-center p-1">
            <a :href="resource.url" target="_blank" rel="noopener noreferrer">
                <img v-if="resourcePreviewOf(resource) === 'image'" class="size-16 rounded-md object-cover"
                    :src="resource.url" :alt="resource.name" />
                <div v-else class="size-16 flex rounded-md border bg-background">
                    <FileTextIcon v-if="resourcePreviewOf(resource) === 'pdf'" class="m-auto icon-lg text-muted-foreground" />
                    <FileIcon v-else class="m-auto icon-lg text-muted-foreground" />
                </div>
            </a>
            <Input type="text" class="h-6 w-16 px-1 text-center text-xs md:text-xs" v-model="resource.name" />
            <Button variant="destructive" size="icon-xs" class="absolute top-0 right-0 rounded-full" @click="remove(index)">
                <TrashIcon />
            </Button>
        </div>
        <div v-if="!selected.length" class="text-muted-foreground flex mx-auto items-center gap-2 h-10">
            <CircleOffIcon />
            <span>{{ $t('activities.steps.fields.resources.empty') }}</span>
        </div>
    </div>
</template>
