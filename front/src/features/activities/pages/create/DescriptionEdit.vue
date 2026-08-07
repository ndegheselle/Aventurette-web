<script setup lang="ts">
import Field from '@chapelure/ui/forms/Field.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import Card from '@chapelure/ui/layout/Card.vue';
import TextEditor from '@features/activities/components/TextEditor.vue';
import type { ActivityData } from '@features/activities/composables/data/activities';
import { routesNames } from '@features/activities/routes';
import { ArrowLeftIcon, ArrowRightIcon, FileTextIcon, LibraryIcon, ListTreeIcon } from '@chapelure/ui/icons';

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
            <li class="step">
                <span class="flex gap-2 items-center">
                    <ListTreeIcon />
                    {{ $t('activities.edit.steps') }}
                </span>
            </li>
            <li class="step">
                <span class="flex gap-2 items-center">
                    <LibraryIcon />
                    {{ $t('activities.edit.properties') }}
                </span>
            </li>
        </ul>
        <Card class="flex-1">
            <Field label="activities.fields.name">
                <input class="input w-full" v-model="activity.name" />
            </Field>
            <Field label="activities.fields.summary">
                <input class="input w-full" v-model="activity.summary" />
            </Field>

            <Field label="activities.fields.description" class="flex-1">
                <TextEditor v-model="activity.description" class="flex-1" />
            </Field>
        </Card>
        <div class="mt-auto flex">
            <RouterLink class="btn" :to="{ name: routesNames.all }">
                <ArrowLeftIcon />
                {{ $t('actions.cancel') }}
            </RouterLink>
            <RouterLink class="btn btn-primary ms-auto" :to="{ name: routesNames.edit.steps }">
                <ArrowRightIcon />
                {{ $t('actions.next') }}
            </RouterLink>
        </div>
    </Container>
</template>