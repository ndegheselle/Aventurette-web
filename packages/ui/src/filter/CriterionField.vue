<script setup lang="ts">
import TagSelect from '@chapelure/ui/data/TagSelect.vue';
import {
    collapseHidesPick,
    hiddenChoiceCount,
    visibleChoices,
    type Criterion,
    type CriterionChoice,
} from '@chapelure/ui/filter/criteria';
import Field from '@chapelure/ui/forms/Field.vue';
import RangeInput from '@chapelure/ui/forms/RangeInput.vue';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';

/**
 * One field of a generated filter form; the criterion's type picks the input. Hand it a draft
 * criterion: the inputs write into it directly and nothing is emitted back up.
 */
const props = defineProps<{ criterion: Criterion }>();

/** A long vocabulary is cut to its first few until the user asks for the rest. */
const expanded = ref(false);

const shown = computed(() => visibleChoices(props.criterion, expanded.value));
const hidden = computed(() => hiddenChoiceCount(props.criterion));

// Opening the modal rebinds this field to a fresh clone of what the list is showing. A pick the
// collapsed list would hide opens it, so the form shows everything it is narrowing by — see
// `collapseHidesPick`.
watch(() => props.criterion, (criterion) => {
    if (collapseHidesPick(criterion)) expanded.value = true;
}, { immediate: true, deep: true });

/** TagSelect binds the choices themselves; a criterion holds their values. */
const tags = computed<CriterionChoice[]>({
    get: () => {
        const criterion = props.criterion;
        if (criterion.type === 'range') return [];

        return criterion.choices.filter(choice => criterion.value.includes(choice.value));
    },
    set: (choices) => {
        const criterion = props.criterion;
        if (criterion.type !== 'range')
            criterion.value = choices.map(choice => choice.value);
    },
});
</script>

<template>
    <Field>
        <template #label>
            <span class="flex items-center gap-1">
                <component :is="criterion.icon" /> {{ $t(criterion.label) }}
            </span>
        </template>

        <div v-if="criterion.type === 'range'" class="flex flex-col gap-1">
            <RangeInput class="text-primary" :floor="criterion.floor" :ceiling="criterion.ceiling"
                v-model:min="criterion.value.min" v-model:max="criterion.value.max" />
            <div class="flex justify-between text-sm opacity-50">
                <span>{{ criterion.value.min ?? criterion.floor }}</span>
                <span>{{ criterion.value.max ?? criterion.ceiling }}</span>
            </div>
        </div>

        <!-- A fixed set is checkboxes, cut to its first few when it is long; a loaded one is searched. -->
        <div v-else-if="criterion.type === 'options'" class="flex gap-2 flex-col">
            <label v-for="choice in shown" :key="choice.value" class="label cursor-pointer gap-2">
                <input type="checkbox" class="checkbox checkbox-sm" :value="choice.value"
                    v-model="criterion.value" />
                <span class="text-sm">{{ $t(choice.label) }}</span>
            </label>

            <button v-if="hidden" type="button" class="btn btn-ghost btn-xs self-start"
                @click="expanded = !expanded">
                <component :is="expanded ? ChevronUpIcon : ChevronDownIcon" class="icon-sm" />
                {{ expanded ? $t('actions.showLess') : $t('actions.showMore', { count: hidden }) }}
            </button>
        </div>

        <TagSelect v-else :items="criterion.choices" display-key="label" v-model="tags" />
    </Field>
</template>
