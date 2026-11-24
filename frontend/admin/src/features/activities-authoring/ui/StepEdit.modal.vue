<script setup lang="ts">
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import TextEditor from '@chapelure/ui/forms/TextEditor.vue';
import MultiSelect from '@chapelure/ui/inputs/MultiSelect.vue';
import { optionsFor, optionsOf, valuesOf, type Option } from '@chapelure/ui/inputs/selection';
import TagSelect from '@chapelure/ui/inputs/TagSelect.vue';
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useDraftModal } from '@chapelure/ui/modals/useDraftModal';
import { useModal, type IEditModal } from '@chapelure/ui/modals/useModal';
import { Button } from '@chapelure/ui/shadcn/button';
import { ButtonGroup } from '@chapelure/ui/shadcn/button-group';
import { Input } from '@chapelure/ui/shadcn/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@chapelure/ui/shadcn/input-group';
import { NativeSelect, NativeSelectOption } from '@chapelure/ui/shadcn/native-select';
import { Textarea } from '@chapelure/ui/shadcn/textarea';
import type { ActivityMaterialData } from '@features/activities/models/material';
import { StepEndCriterion, StepKind, type ActivityStepData, type ActivityTipData } from '@features/activities/models/step';
import ResourcesSelection from '@features/activities-authoring/ui/ResourcesSelection.vue';
import { joinDuration, splitDuration, stepProblems } from '@features/activities-authoring/models/step.edit';
import { CheckIcon, XIcon } from 'lucide-vue-next';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * The activity's materials, which a step recalls rather than owns, and the catalogue of tips it
 * may link.
 */
const { materials = [], tips = [] } = defineProps<{
    materials?: ActivityMaterialData[];
    tips?: ActivityTipData[];
}>();

// Writes nothing: confirming hands the edited copy back, and the activity's save writes it with
// its files. A new step and an existing one open the same way.
const controller = useModal<ActivityStepData>();
const { show, confirm, cancel, data: step, errors } = useDraftModal(controller, stepProblems);

const { t } = useI18n();

const kinds = Object.values(StepKind);

const endCriterionOptions = computed(() =>
    optionsOf(Object.values(StepEndCriterion), value => t(`activities.steps.endCriterion.${value}`)));
const endCriteria = computed<Option<StepEndCriterion>[]>({
    get: () => optionsFor(endCriterionOptions.value, step.value.end_criteria ?? []),
    set: picked => { step.value.end_criteria = valuesOf(picked); },
});

const hours = computed({
    get: () => splitDuration(step.value.duration).hours,
    set: (value: number | string) => { step.value.duration = joinDuration(value, minutes.value); },
});
const minutes = computed({
    get: () => splitDuration(step.value.duration).minutes,
    set: (value: number | string) => { step.value.duration = joinDuration(hours.value, value); },
});

defineExpose<IEditModal<ActivityStepData>>({ show });
</script>

<template>
    <Modal :controller>
        <template #title>
            {{ $t('actions.update') }}
        </template>
        <div class="flex flex-col gap-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="activities.steps.fields.title" class="md:col-span-2" :error="errors.get('title')">
                    <Input type="text" v-model="step.title" />
                </Field>
                <Field label="activities.steps.fields.duration" :error="errors.get('duration')">
                    <ButtonGroup class="w-full">
                        <InputGroup>
                            <InputGroupInput type="number" min="0" v-model.number="hours" />
                            <InputGroupAddon align="inline-end">{{ $t('activities.authoring.steps.hours') }}</InputGroupAddon>
                        </InputGroup>
                        <InputGroup>
                            <InputGroupInput type="number" min="0" max="59" v-model.number="minutes" />
                            <InputGroupAddon align="inline-end">{{ $t('activities.authoring.steps.minutes') }}</InputGroupAddon>
                        </InputGroup>
                    </ButtonGroup>
                </Field>
            </div>
            <Field label="activities.steps.fields.kind" :error="errors.get('kind')">
                <NativeSelect class="w-full" v-model="step.kind">
                    <NativeSelectOption v-for="value in kinds" :key="value" :value="value">
                        {{ $t(`activities.steps.kind.${value}`) }}
                    </NativeSelectOption>
                </NativeSelect>
            </Field>
            <Field label="activities.steps.fields.description" :error="errors.get('description')">
                <TextEditor v-model="step.description" class="min-h-32" />
            </Field>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="activities.steps.fields.endCriteria" :error="errors.get('end_criteria')">
                    <MultiSelect :items="endCriterionOptions" displayKey="label" keyBy="value" v-model="endCriteria" />
                </Field>
                <Field label="activities.steps.fields.endCriteriaOther" :error="errors.get('end_criteria_other')">
                    <Input type="text" v-model="step.end_criteria_other" />
                </Field>
            </div>
            <Field label="activities.steps.fields.visualBrief" :error="errors.get('visual_brief')">
                <Textarea v-model="step.visual_brief" />
            </Field>
            <Field label="activities.tips.title">
                <TagSelect :items="tips" displayKey="name" keyBy="id" v-model="step.tips" />
            </Field>
            <Field label="activities.steps.fields.materials.title">
                <TagSelect :items="materials" displayKey="name" keyBy="id" v-model="step.materials" />
            </Field>
            <Field label="activities.steps.fields.resources.title">
                <ResourcesSelection v-model="step.resources" :step-id="step.id" />
            </Field>
        </div>
        <FieldError :error="errors.global.value" />
        <template #actions>
            <Button variant="outline" @click="cancel">
                <XIcon />
                {{ $t('actions.cancel') }}
            </Button>
            <Button @click="confirm">
                <CheckIcon />
                {{ $t('actions.confirm') }}
            </Button>
        </template>
    </Modal>
</template>
