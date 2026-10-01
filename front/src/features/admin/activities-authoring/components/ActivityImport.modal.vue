<script setup lang="ts">
import FilesInput from '@chapelure/ui/files/FilesInput.vue';
import FilesList from '@chapelure/ui/files/FilesList.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import { useActivityImport } from '@features/admin/activities-authoring/composables/useActivityImport';
import { ArrowLeftIcon, ArrowRightIcon, CircleCheckIcon, ImportIcon, TagIcon, TriangleAlertIcon, XIcon } from 'lucide-vue-next';

// Opened from the authoring list; on success the composable has already left for the editor.
const controller = useModal();
const {
    stage,
    fileName,
    sheet,
    problems,
    preview,
    visual,
    isImporting,
    errors,
    start,
    readSheet,
    pickVisual,
    next,
    back,
    importSheet,
} = useActivityImport();

function show() {
    start();
    return controller.show();
}

async function confirm() {
    if (await importSheet())
        controller.confirm(true);
}

defineExpose({ show });
</script>

<template>
    <Modal :controller>
        <template #title>
            {{ $t('activities.authoring.import.title') }}
        </template>

        <ul class="steps w-full my-4">
            <li class="step step-primary">{{ $t('activities.authoring.import.stages.sheet') }}</li>
            <li class="step" :class="{ 'step-primary': stage === 'visual' }">
                {{ $t('activities.authoring.import.stages.visual') }}
            </li>
        </ul>

        <div v-if="stage === 'sheet'" class="flex flex-col gap-2">
            <FilesInput accept=".json,application/json" @change="readSheet">
                <template #constraints>
                    {{ $t('activities.authoring.import.sheet.constraints') }}
                </template>
            </FilesInput>

            <div v-if="problems.length" role="alert" class="alert alert-error alert-soft items-start">
                <TriangleAlertIcon />
                <div>
                    <b>{{ $t('activities.authoring.import.problems.title', { file: fileName }) }}</b>
                    <ul class="list-disc ms-4 text-sm">
                        <li v-for="(problem, index) in problems" :key="index">
                            {{ $t(`activities.authoring.import.problems.${problem.code}`, { path: problem.path, value: problem.value }) }}
                        </li>
                    </ul>
                </div>
            </div>

            <div v-else-if="sheet" role="status" class="alert alert-success alert-soft items-start">
                <CircleCheckIcon />
                <div>
                    <b>{{ sheet.name }}</b>
                    <span class="text-xs opacity-60 ms-2">{{ fileName }}</span>
                    <p class="text-sm">
                        {{ $t('activities.authoring.import.sheet.summary', {
                            steps: sheet.steps.length,
                            materials: sheet.materials.length,
                            workshops: sheet.workshops.length,
                        }) }}
                    </p>
                </div>
            </div>

            <div v-if="preview?.unknown.length" role="alert" class="alert alert-warning alert-soft items-start">
                <TagIcon />
                <div>
                    <b>{{ $t('activities.authoring.import.unknown') }}</b>
                    <ul class="list-disc ms-4 text-sm">
                        <li v-for="(reference, index) in preview.unknown" :key="index">
                            {{ $t(reference.label) }} : {{ reference.name }}
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div v-else class="flex flex-col gap-2">
            <FilesInput accept="image/*" @change="pickVisual">
                <template #constraints>
                    {{ $t('activities.constraints.picture') }}
                </template>
            </FilesInput>
            <FilesList :files="visual" />
            <p class="text-sm opacity-60">{{ $t('activities.authoring.import.visual.optional') }}</p>
        </div>

        <FieldError :error="errors.global.value" />

        <template #actions>
            <button class="btn" @click="() => controller.cancel()">
                <XIcon />
                {{ $t('actions.cancel') }}
            </button>
            <template v-if="stage === 'sheet'">
                <button class="btn btn-primary" :disabled="!sheet" @click="next">
                    {{ $t('activities.authoring.import.next') }}
                    <ArrowRightIcon />
                </button>
            </template>
            <template v-else>
                <button class="btn" :disabled="isImporting" @click="back">
                    <ArrowLeftIcon />
                    {{ $t('activities.authoring.import.back') }}
                </button>
                <button class="btn btn-primary" :disabled="isImporting" @click="confirm">
                    <span v-if="isImporting" class="loading loading-spinner loading-sm"></span>
                    <ImportIcon v-else />
                    {{ $t('activities.authoring.import.confirm') }}
                </button>
            </template>
        </template>
    </Modal>
</template>
