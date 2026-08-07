<script setup lang="ts">
import Field from '@chapelure/ui/forms/Field.vue';
import FilesInput from '@chapelure/ui/files/FilesInput.vue';
import FilesList from '@chapelure/ui/files/FilesList.vue';
import { useOneFile } from '@chapelure/ui/files/useFiles';
import TagSelect from '@chapelure/ui/data/TagSelect.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import Card from '@chapelure/ui/layout/Card.vue';
import type { ActivityData } from '@features/activities/composables/data/activities';
import { type BenefitData, useBenefits } from '@features/activities/composables/data/benefits';
import { availablesEnvironments } from '@features/activities/locales/helpers';
import { routesNames } from '@features/activities/routes';
import { ArrowLeftIcon, ArrowRightIcon, FileTextIcon, LibraryIcon, ListTreeIcon } from '@chapelure/ui/icons';
import { onMounted, ref } from 'vue';

const availableBenefits = ref<BenefitData[]>([]);
const benefits = useBenefits();
const { files, update: updateImage } = useOneFile();

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

        <Card class="flex-1">
            <Field label="activities.fields.picture">
                <FilesInput accept="image/*" @change="updateImage">
                    <template #constraints>
                        {{ $t('activities.contraints.picture') }}
                    </template>
                </FilesInput>
                <FilesList :files />
            </Field>
            <Field label="activities.fields.age">
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
            </Field>
            <div class="grid grid-cols-2 gap-2">
                <Field label="activities.fields.environment">
                    <select class="select w-full">
                        <option v-for="env in availablesEnvironments" :key="env.value" :value="env.value">
                            {{ $t(env.label) }}
                        </option>
                    </select>
                </Field>
                <Field label="activities.fields.durationMinutes">
                    <input type="number" class="input w-full" />
                </Field>
            </div>
            <Field label="activities.fields.benefits">
                <TagSelect :items="availableBenefits" display-key="name" />
            </Field>
        </Card>

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