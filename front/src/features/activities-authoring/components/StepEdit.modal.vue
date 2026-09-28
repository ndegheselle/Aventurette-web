<script setup lang="ts">
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import TextEditor from '@chapelure/ui/forms/TextEditor.vue';
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useEditModal } from '@chapelure/ui/modals/useEditModal';
import { useModal, type IEditModal } from '@chapelure/ui/modals/useModal';
import { stepsApi } from '@features/activities-authoring/api/steps.api';
import RecordsPicker from '@features/activities-authoring/components/RecordsPicker.vue';
import ResourcesSelection from '@features/activities-authoring/components/ResourcesSelection.vue';
import type { ActivityMaterialData } from '@features/activities/model/material';
import { EndCriterion, hasEndCriteria, StepKind, type ActivityStepData } from '@features/activities/model/step';
import { MinusIcon, PlusIcon, SaveIcon, XIcon } from 'lucide-vue-next';

/** The activity's materials: a step recalls the ones it uses, it does not own any. */
const { materials = [] } = defineProps<{ materials?: ActivityMaterialData[] }>();

// Only ever updates: a step is written blank when it is added, so what this opens on is already
// a record — which is what lets its files be saved as they are chosen.
const controller = useModal<ActivityStepData>();
const { show, confirm, cancel, data: step, errors, isLoading } = useEditModal(controller, stepsApi);

const kinds = Object.values(StepKind);
const endCriteria = Object.values(EndCriterion);

function addAction() {
    step.value.actions = [...step.value.actions, ""];
}

function removeAction(index: number) {
    step.value.actions = step.value.actions.filter((_, i) => i !== index);
}

defineExpose<IEditModal<ActivityStepData>>({ show });
</script>

<template>
    <Modal :controller>
        <template #title>
            {{ $t('actions.update') }}
        </template>
        <div class="flex flex-col">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                <Field label="activities.steps.fields.title" class="md:col-span-2" :error="errors.get('title')">
                    <input type="text" class="input w-full" v-model="step.title" />
                </Field>
                <Field label="activities.steps.fields.duration" :error="errors.get('duration')">
                    <input type="number" min="0" class="input w-full" v-model.number="step.duration" />
                </Field>
            </div>
            <Field label="activities.steps.fields.kind" :error="errors.get('kind')">
                <select class="select w-full" v-model="step.kind">
                    <option v-for="value in kinds" :key="value" :value="value">
                        {{ $t(`activities.steps.kind.${value}`) }}
                    </option>
                </select>
            </Field>
            <Field label="activities.steps.fields.description" :error="errors.get('description')">
                <TextEditor v-model="step.description" class="min-h-32" />
            </Field>
            <Field label="activities.steps.fields.actions.title" :error="errors.get('actions')">
                <div class="flex flex-col gap-1">
                    <div class="join" v-for="(_, index) in step.actions" :key="index">
                        <span class="join-item btn btn-sm tabular-nums">{{ index + 1 }}</span>
                        <input type="text" class="join-item input input-sm w-full" v-model="step.actions[index]" />
                        <button class="join-item btn btn-sm" @click="() => removeAction(index)">
                            <MinusIcon class="icon-sm" />
                        </button>
                    </div>
                    <button class="btn btn-sm btn-ghost self-start" @click="addAction">
                        <PlusIcon class="icon-sm" /> {{ $t('activities.authoring.steps.addAction') }}
                    </button>
                </div>
            </Field>
            <Field label="activities.steps.fields.visualBrief" :error="errors.get('visual_brief')">
                <textarea class="textarea w-full" v-model="step.visual_brief"></textarea>
            </Field>
            <template v-if="hasEndCriteria(step)">
                <Field label="activities.steps.fields.endCriteria.title" :error="errors.get('end_criteria')">
                    <label class="label" v-for="value in endCriteria" :key="value">
                        <input type="checkbox" class="checkbox checkbox-sm" :value v-model="step.end_criteria" />
                        {{ $t(`activities.steps.endCriterion.${value}`) }}
                    </label>
                </Field>
                <Field label="activities.steps.fields.endCriteria.other" :error="errors.get('end_criteria_other')">
                    <input type="text" class="input w-full" v-model="step.end_criteria_other" />
                </Field>
            </template>
            <Field label="activities.steps.fields.tip" :error="errors.get('tip')">
                <TextEditor v-model="step.tip" class="min-h-24" />
            </Field>
            <RecordsPicker label="activities.steps.fields.materials.title" :items="materials"
                v-model="step.materials" />
            <Field label="activities.steps.fields.resources.title">
                <ResourcesSelection v-model="step.resources" :step="step.id" />
            </Field>
        </div>
        <FieldError :error="errors.global.value" />
        <template #actions>
            <button class="btn" @click="cancel">
                <XIcon />
                {{ $t('actions.cancel') }}
            </button>
            <button class="btn btn-primary" :disabled="isLoading" @click="confirm">
                <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
                <SaveIcon />
                {{ $t('actions.save') }}
            </button>
        </template>
    </Modal>
</template>
