<script setup lang="ts">
import Group from '@chapelure/common/components/layout/Group.vue';
import Container from '@chapelure/common/components/layout/Container.vue';
import type { ActivityData } from '@features/activities/data/activities';
import { ArrowLeftIcon, ArrowRightIcon, FileTextIcon, LibraryIcon, ListTreeIcon } from 'lucide-vue-next';
import { routesNames } from '@features/activities/routes';
import FieldLabel from '@chapelure/common/components/form/FieldLabel.vue';
import ImageInput from '@chapelure/common/components/inputs/ImageInput.vue';
import { availablesEnvironments } from '@features/activities/locales/helpers';
import TagSelect from '@chapelure/common/components/inputs/TagSelect.vue';
import { ref, onMounted } from 'vue';
import { type BenefitData, benefits } from '@features/activities/data/benefits';

const availableBenefits = ref<BenefitData[]>([]);

defineProps<{
    activity: ActivityData;
}>();

onMounted(async () => {
    availableBenefits.value = await benefits.getAll();
});
</script>

<template>
    <Container>
        <ul class="steps">
            <li class="step step-primary">
                <span class="flex gap-2 items-center">
                    <FileTextIcon /> {{ $t('activities.edit.description') }}
                </span>
            </li>
            <li class="step step-primary">
                <span class="flex gap-2 items-center">
                    <ListTreeIcon />
                    {{ $t('activities.edit.steps') }}
                </span>
            </li>
            <li class="step step-primary">
                <span class="flex gap-2 items-center">
                    <LibraryIcon />
                    {{ $t('activities.edit.properties') }}
                </span>
            </li>
        </ul>

        <Group class="flex-1">
            <FieldLabel label="activities.fields.picture">
                <ImageInput>
                    <template #constraints>
                        {{ $t('activities.contraints.picture') }}
                    </template>
                </ImageInput>
            </FieldLabel>
                <FieldLabel label="activities.fields.age">
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <span class="text-sm opacity-50">{{ $t('data.minimum') }}</span>
                            <input type="number" class="input w-full" />
                        </div>
                        <div>
                            <span class="text-sm opacity-50">{{ $t('data.maximum') }}</span>
                            <input type="number" class="input w-full" />
                        </div>
                    </div>
                </FieldLabel>
            <div class="grid grid-cols-2 gap-2">
                <FieldLabel label="activities.fields.environment">
                    <select class="select w-full">
                        <option v-for="env in availablesEnvironments" :key="env.value" :value="env.value">
                            {{ $t(env.label) }}
                        </option>
                    </select>
                </FieldLabel>
                <FieldLabel label="activities.fields.durationMinutes">
                    <input type="number" class="input w-full" />
                </FieldLabel>
            </div>
            <FieldLabel label="activities.fields.benefits">
                <TagSelect :items="availableBenefits" display-key="name" />
            </FieldLabel>
        </Group>

        <div class="mt-auto flex">
            <RouterLink class="btn" :to="{ name: routesNames.edit.description }">
                <ArrowLeftIcon />
                {{ $t('actions.previous') }}
            </RouterLink>
            <RouterLink class="btn btn-primary ms-auto" :to="{ name: routesNames.edit.properties }">
                <ArrowRightIcon />
                {{ $t('actions.create') }}
            </RouterLink>
        </div>
    </Container>
</template>