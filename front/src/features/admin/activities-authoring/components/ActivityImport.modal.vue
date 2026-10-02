<script setup lang="ts">
import FilesInput from '@chapelure/ui/files/FilesInput.vue';
import FilesList from '@chapelure/ui/files/FilesList.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import ResourcesSelection from '@features/admin/activities-authoring/components/ResourcesSelection.vue';
import { IMPORT_STAGES, useActivityImport } from '@features/admin/activities-authoring/composables/useActivityImport';
import { referenceKey } from '@features/admin/activities-authoring/model/activity.import';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    CircleCheckIcon,
    ImportIcon,
    ListTodoIcon,
    TagIcon,
    TriangleAlertIcon,
    XIcon,
} from 'lucide-vue-next';

// Opened from the authoring list; on success the composable has already left for the editor.
const controller = useModal();
const {
    stage,
    fileName,
    sheet,
    problems,
    preview,
    picks,
    unset,
    stepFiles,
    visual,
    isImporting,
    errors,
    start,
    readSheet,
    candidates,
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
            <li v-for="(name, index) in IMPORT_STAGES" :key="name" class="step"
                :class="{ 'step-primary': index <= IMPORT_STAGES.indexOf(stage) }">
                {{ $t(`activities.authoring.import.stages.${name}`) }}
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

        </div>

        <div v-else-if="stage === 'complete'" class="flex flex-col gap-4">
            <div v-if="preview?.unknown.length" class="flex flex-col gap-2">
                <div role="alert" class="alert alert-warning alert-soft">
                    <TagIcon />
                    <span>{{ $t('activities.authoring.import.unknown') }}</span>
                </div>
                <label v-for="reference in preview.unknown" :key="referenceKey(reference)"
                       class="flex flex-wrap items-center gap-2">
                    <span class="grow text-sm">
                        <span class="opacity-60">{{ $t(reference.label) }} :</span> {{ reference.name }}
                    </span>
                    <select v-model="picks[referenceKey(reference)]" class="select select-sm w-64">
                        <option :value="undefined">{{ $t('activities.authoring.import.leaveOff') }}</option>
                        <option v-for="candidate in candidates(reference.kind)" :key="candidate.id" :value="candidate.id">
                            {{ candidate.name }}
                        </option>
                    </select>
                </label>
            </div>

            <div v-if="unset.length" role="status" class="alert alert-info alert-soft items-start">
                <ListTodoIcon />
                <div>
                    <b>{{ $t('activities.authoring.import.unset.title') }}</b>
                    <ul class="list-disc ms-4 text-sm">
                        <li v-for="field in unset" :key="field.label">
                            {{ $t(field.label) }}<template v-if="field.steps"> : {{ field.steps.join(', ') }}</template>
                        </li>
                    </ul>
                </div>
            </div>

            <div v-if="!preview?.unknown.length && !unset.length" role="status" class="alert alert-success alert-soft">
                <CircleCheckIcon />
                <span>{{ $t('activities.authoring.import.complete') }}</span>
            </div>
        </div>

        <div v-else class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <b>{{ $t('activities.fields.picture') }}</b>
                <FilesInput accept="image/*" @change="pickVisual">
                    <template #constraints>
                        {{ $t('activities.constraints.picture') }}
                    </template>
                </FilesInput>
                <FilesList :files="visual" />
            </div>

            <div v-for="(files, index) in stepFiles" :key="files.id" class="flex flex-col gap-1">
                <b>{{ $t('activities.authoring.import.stepResources', { title: sheet?.steps[index]?.title }) }}</b>
                <ResourcesSelection v-model="files.resources" :step="files.id" />
            </div>

            <p class="text-sm opacity-60">{{ $t('activities.authoring.import.files.optional') }}</p>
        </div>

        <FieldError :error="errors.global.value" />

        <template #actions>
            <button class="btn" @click="() => controller.cancel()">
                <XIcon />
                {{ $t('actions.cancel') }}
            </button>
            <template v-if="stage !== 'files'">
                <button v-if="stage !== 'sheet'" class="btn" @click="back">
                    <ArrowLeftIcon />
                    {{ $t('activities.authoring.import.back') }}
                </button>
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
