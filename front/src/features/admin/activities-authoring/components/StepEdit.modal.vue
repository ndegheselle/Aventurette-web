<script setup lang="ts">
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import TextEditor from '@chapelure/ui/forms/TextEditor.vue';
import TagSelect from '@chapelure/ui/inputs/TagSelect.vue';
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useDraftModal } from '@chapelure/ui/modals/useDraftModal';
import { useModal, type IEditModal } from '@chapelure/ui/modals/useModal';
import type { ActivityMaterialData } from '@features/activities/model/material';
import { StepKind, type ActivityStepData } from '@features/activities/model/step';
import ResourcesSelection from '@features/admin/activities-authoring/components/ResourcesSelection.vue';
import { joinDuration, splitDuration, stepProblems } from '@features/admin/activities-authoring/model/step.edit';
import { CheckIcon, PlusIcon, TrashIcon, XIcon } from 'lucide-vue-next';
import { computed } from 'vue';

/** The activity's materials: a step recalls the ones it uses, it does not own any. */
const { materials = [] } = defineProps<{ materials?: ActivityMaterialData[] }>();

// Writes nothing: confirming hands the edited copy back, and the activity's save writes it with
// its files. A new step and an existing one open the same way.
const controller = useModal<ActivityStepData>();
const { show, confirm, cancel, data: step, errors } = useDraftModal(controller, stepProblems);

const kinds = Object.values(StepKind);

const hours = computed({
    get: () => splitDuration(step.value.duration).hours,
    set: (value: number | string) => { step.value.duration = joinDuration(value, minutes.value); },
});
const minutes = computed({
    get: () => splitDuration(step.value.duration).minutes,
    set: (value: number | string) => { step.value.duration = joinDuration(hours.value, value); },
});

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
                    <div class="join w-full">
                        <label class="join-item input w-full">
                            <input type="number" min="0" v-model.number="hours" />
                            <span class="label">{{ $t('activities.authoring.steps.hours') }}</span>
                        </label>
                        <label class="join-item input w-full">
                            <input type="number" min="0" max="59" v-model.number="minutes" />
                            <span class="label">{{ $t('activities.authoring.steps.minutes') }}</span>
                        </label>
                    </div>
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
                            <TrashIcon class="icon-sm" />
                        </button>
                    </div>
                    <button class="btn btn-sm btn-ghost self-start" @click="addAction">
                        <PlusIcon class="icon-sm" /> {{ $t('activities.authoring.steps.addAction') }}
                    </button>
                </div>
            </Field>
            <Field label="activities.steps.fields.materials.title">
                <TagSelect :items="materials" displayKey="name" keyBy="id" v-model="step.materials" />
            </Field>
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
            <button class="btn btn-primary" @click="confirm">
                <CheckIcon />
                {{ $t('actions.confirm') }}
            </button>
        </template>
    </Modal>
</template>
