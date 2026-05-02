<script setup lang="ts">
import Group from '@chapelure/common/components/layout/Group.vue';
import Container from '@chapelure/common/components/layout/Container.vue';
import type { ActivityData } from '@features/activities/data/activities';
import { ArrowLeftIcon, ArrowRightIcon, FileTextIcon, ImageIcon, LibraryIcon, ListTreeIcon, UploadIcon } from 'lucide-vue-next';
import { routesNames } from '@features/activities/routes';
import FieldLabel from '@chapelure/common/components/form/FieldLabel.vue';
import { availablesEnvironments } from '@features/activities/locales/helpers';

defineProps<{
    activity: ActivityData;
}>();
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
                <div class="rounded-box border border-dashed border-base-300 h-32 flex flex-col justify-center items-center">
                    <UploadIcon class="icon-xl opacity-50"/>
                    <span v-html="$t('inputs.image.upload')"></span>
                    <label class="label text-sm">{{ $t('activities.contraints.picture') }}</label>
                </div>
                <input type="file" class="file-input w-full mt-1" />
            </FieldLabel>
            <div class="grid grid-cols-3 gap-2">
                <FieldLabel label="activities.fields.environment">
                    <select class="select w-full">
                        <option v-for="env in availablesEnvironments" :key="env.value" :value="env.value">
                            {{ $t(env.label) }}
                        </option>
                    </select>
                </FieldLabel>
                <FieldLabel label="activities.fields.age">
                    <div class="flex flex-col gap-1">
                        <div class="flex gap-1 items-center">
                            <span class="text-sm opacity-50">{{ $t('data.minimum') }}</span>
                            <input type="number" class="input w-full" />
                        </div>
                        <div class="flex gap-1 items-center">
                            <span class="text-sm opacity-50">{{ $t('data.maximum') }}</span>
                            <input type="number" class="input w-full" />
                        </div>
                    </div>
                </FieldLabel>
                <FieldLabel label="activities.fields.durationMinutes">
                    <input type="number" class="input w-full" />
                </FieldLabel>
            </div>
            <FieldLabel label="activities.fields.benefits">
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