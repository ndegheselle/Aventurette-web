<script setup lang="ts">
import FilesList from '@chapelure/common/components/data/FilesList.vue';
import FieldLabel from '@chapelure/common/components/form/FieldLabel.vue';
import FilesInput from '@chapelure/common/components/inputs/FilesInput.vue';
import TagSelect from '@chapelure/common/components/inputs/TagSelect.vue';
import Container from '@chapelure/common/components/layout/Container.vue';
import Group from '@chapelure/common/components/layout/Group.vue';
import type { ActivityData } from '@features/activities/composables/data/activities';
import { type BenefitData, useBenefits } from '@features/activities/composables/data/benefits';
import { availablesEnvironments } from '@features/activities/locales/helpers';
import { routesNames } from '@features/activities/routes';
import { ArrowLeftIcon, ArrowRightIcon, FileTextIcon, LibraryIcon, ListTreeIcon } from 'lucide-vue-next';
import { onMounted, ref } from 'vue';

const availableBenefits = ref<BenefitData[]>([]);
const benefits = useBenefits();
const images = ref<File[]>([]);

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
                <FilesInput accept="image/*" @change="$event => (images = images.concat($event))">
                    <template #constraints>
                        {{ $t('activities.contraints.picture') }}
                    </template>
                </FilesInput>
                <FilesList v-model="images" />
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
            <RouterLink class="btn" :to="{ name: routesNames.edit.steps }">
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