<script setup lang="ts">
import FilesInput from '@chapelure/ui/files/FilesInput.vue';
import FilesList from '@chapelure/ui/files/FilesList.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import { Alert, AlertDescription, AlertTitle } from '@chapelure/ui/shadcn/alert';
import { Button } from '@chapelure/ui/shadcn/button';
import { NativeSelect, NativeSelectOption } from '@chapelure/ui/shadcn/native-select';
import { Spinner } from '@chapelure/ui/shadcn/spinner';
import ResourcesSelection from '@features/activities-authoring/ui/ResourcesSelection.vue';
import { IMPORT_STAGES, useActivityImport } from '@features/activities-authoring/composables/useActivityImport';
import { referenceKey } from '@features/activities-authoring/models/activity.import';
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

        <!-- The stages so far are filled, and joined to the one before by a line. -->
        <ol class="my-4 flex w-full">
            <li v-for="(name, index) in IMPORT_STAGES" :key="name"
                class="relative flex flex-1 flex-col items-center gap-1 text-center text-sm before:absolute before:top-3 before:right-1/2 before:h-px before:w-full first:before:hidden"
                :class="index <= IMPORT_STAGES.indexOf(stage) ? 'before:bg-primary' : 'before:bg-border'">
                <span class="z-10 flex size-6 items-center justify-center rounded-full border text-xs"
                      :class="index <= IMPORT_STAGES.indexOf(stage) ? 'border-primary bg-primary text-primary-foreground' : 'bg-background'">
                    {{ index + 1 }}
                </span>
                {{ $t(`activities.authoring.import.stages.${name}`) }}
            </li>
        </ol>

        <div v-if="stage === 'sheet'" class="flex flex-col gap-2">
            <FilesInput accept=".json,application/json" @change="readSheet">
                <template #constraints>
                    {{ $t('activities.authoring.import.sheet.constraints') }}
                </template>
            </FilesInput>

            <Alert v-if="problems.length" variant="destructive">
                <TriangleAlertIcon />
                <AlertTitle>{{ $t('activities.authoring.import.problems.title', { file: fileName }) }}</AlertTitle>
                <AlertDescription>
                    <ul class="list-disc ms-4">
                        <li v-for="(problem, index) in problems" :key="index">
                            {{ $t(`activities.authoring.import.problems.${problem.code}`, { path: problem.path, value: problem.value }) }}
                        </li>
                    </ul>
                </AlertDescription>
            </Alert>

            <Alert v-else-if="sheet" role="status">
                <CircleCheckIcon />
                <AlertTitle>
                    {{ sheet.name }}
                    <span class="text-xs font-normal text-muted-foreground ms-2">{{ fileName }}</span>
                </AlertTitle>
                <AlertDescription>
                    {{ $t('activities.authoring.import.sheet.summary', {
                        steps: sheet.steps.length,
                        materials: sheet.materials.length,
                        workshops: sheet.workshops.length,
                    }) }}
                </AlertDescription>
            </Alert>

        </div>

        <div v-else-if="stage === 'complete'" class="flex flex-col gap-4">
            <div v-if="preview?.unknown.length" class="flex flex-col gap-2">
                <Alert variant="destructive">
                    <TagIcon />
                    <AlertTitle>{{ $t('activities.authoring.import.unknown') }}</AlertTitle>
                </Alert>
                <!-- "Leave off" is the empty value, which no candidate's id matches. -->
                <label v-for="reference in preview.unknown" :key="referenceKey(reference)"
                       class="flex flex-wrap items-center gap-2">
                    <span class="grow text-sm">
                        <span class="text-muted-foreground">{{ $t(reference.label) }} :</span> {{ reference.name }}
                    </span>
                    <NativeSelect v-model="picks[referenceKey(reference)]" class="w-64">
                        <NativeSelectOption value="">{{ $t('activities.authoring.import.leaveOff') }}</NativeSelectOption>
                        <NativeSelectOption v-for="candidate in candidates(reference.kind)" :key="candidate.id" :value="candidate.id">
                            {{ candidate.name }}
                        </NativeSelectOption>
                    </NativeSelect>
                </label>
            </div>

            <Alert v-if="unset.length" role="status">
                <ListTodoIcon />
                <AlertTitle>{{ $t('activities.authoring.import.unset.title') }}</AlertTitle>
                <AlertDescription>
                    <ul class="list-disc ms-4">
                        <li v-for="field in unset" :key="field.label">
                            {{ $t(field.label) }}<template v-if="field.steps"> : {{ field.steps.join(', ') }}</template>
                        </li>
                    </ul>
                </AlertDescription>
            </Alert>

            <Alert v-if="!preview?.unknown.length && !unset.length" role="status">
                <CircleCheckIcon />
                <AlertTitle>{{ $t('activities.authoring.import.complete') }}</AlertTitle>
            </Alert>
        </div>

        <div v-else class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <b>{{ $t('activities.fields.picture') }}</b>
                <FilesInput accept="image/*" @change="pickVisual">
                    <template #constraints>
                        {{ $t('activities.constraints.picture') }}
                    </template>
                </FilesInput>
                <FilesList v-model:files="visual" />
            </div>

            <div v-for="(files, index) in stepFiles" :key="files.id" class="flex flex-col gap-1">
                <b>{{ $t('activities.authoring.import.stepResources', { title: sheet?.steps[index]?.title }) }}</b>
                <ResourcesSelection v-model="files.resources" :step-id="files.id" />
            </div>

            <p class="text-sm text-muted-foreground">{{ $t('activities.authoring.import.files.optional') }}</p>
        </div>

        <FieldError :error="errors.global.value" />

        <template #actions>
            <Button variant="outline" @click="() => controller.cancel()">
                <XIcon />
                {{ $t('actions.cancel') }}
            </Button>
            <template v-if="stage !== 'files'">
                <Button v-if="stage !== 'sheet'" variant="outline" @click="back">
                    <ArrowLeftIcon />
                    {{ $t('activities.authoring.import.back') }}
                </Button>
                <Button :disabled="!sheet" @click="next">
                    {{ $t('activities.authoring.import.next') }}
                    <ArrowRightIcon />
                </Button>
            </template>
            <template v-else>
                <Button variant="outline" :disabled="isImporting" @click="back">
                    <ArrowLeftIcon />
                    {{ $t('activities.authoring.import.back') }}
                </Button>
                <Button :disabled="isImporting" @click="confirm">
                    <Spinner v-if="isImporting" />
                    <ImportIcon v-else />
                    {{ $t('activities.authoring.import.confirm') }}
                </Button>
            </template>
        </template>
    </Modal>
</template>
