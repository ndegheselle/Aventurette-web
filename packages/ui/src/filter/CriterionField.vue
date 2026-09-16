<script setup lang="ts">
import TagSelect from '@chapelure/ui/data/TagSelect.vue';
import type { Criterion, CriterionChoice } from '@chapelure/ui/filter/criteria';
import Field from '@chapelure/ui/forms/Field.vue';
import { computed } from 'vue';

/**
 * One field of a generated filter form: the criterion's type picks the input.
 *
 * The criterion handed in is the modal's draft, and the inputs write into it directly — which
 * is the point of a draft, and why nothing is emitted back up.
 */
const props = defineProps<{ criterion: Criterion }>();

/** TagSelect works in the choices themselves and compares them by identity; a criterion holds values. */
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

        <div v-if="criterion.type === 'range'" class="flex gap-2 items-center">
            <span class="text-sm opacity-50">{{ $t('data.minimum') }}</span>
            <input type="number" class="input input-sm w-full" v-model="criterion.value.min" />
            <span class="text-sm opacity-50">{{ $t('data.maximum') }}</span>
            <input type="number" class="input input-sm w-full" v-model="criterion.value.max" />
        </div>

        <!-- Options are a fixed set, so they are all on screen; tags are a catalogue, so they are searched. -->
        <div v-else-if="criterion.type === 'options'" class="flex gap-2 flex-col">
            <label v-for="choice in criterion.choices" :key="choice.value" class="label cursor-pointer gap-2">
                <input type="checkbox" class="checkbox checkbox-sm" :value="choice.value"
                    v-model="criterion.value" />
                <span class="text-sm">{{ $t(choice.label) }}</span>
            </label>
        </div>

        <TagSelect v-else :items="criterion.choices" display-key="label" v-model="tags" />
    </Field>
</template>
