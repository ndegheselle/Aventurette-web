<script setup lang="ts">
import TagSelect from '@chapelure/ui/data/TagSelect.vue';
import type { Criterion, CriterionChoice } from '@chapelure/ui/filter/criteria';
import Field from '@chapelure/ui/forms/Field.vue';
import RangeInput from '@chapelure/ui/forms/RangeInput.vue';
import { computed } from 'vue';

/**
 * One field of a generated filter form; the criterion's type picks the input. Hand it a draft
 * criterion: the inputs write into it directly and nothing is emitted back up.
 */
const props = defineProps<{ criterion: Criterion }>();

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

        <!-- A fixed set fits on screen; a loaded catalogue is searched. -->
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
