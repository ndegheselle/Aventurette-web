<script setup lang="ts">
import Field from '@chapelure/ui/forms/Field.vue';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-vue-next';
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import EditSteps from '@features/activities/pages/edit/_components/EditSteps.vue';
import TextEditor from '@features/activities/components/TextEditor.vue';
import type { ActivityData } from '@features/activities/model/activity';
import { routesNames } from '@features/activities/routes';

defineProps<{
    activity: ActivityData;
}>();
</script>

<template>
    <Container>
        <EditSteps current="description" />
        <Panel class="flex-1">
            <Field label="activities.fields.name">
                <input type="text" class="input w-full" v-model="activity.name" />
            </Field>
            <Field label="activities.fields.description" class="flex-1">
                <TextEditor v-model="activity.description" class="flex-1" />
            </Field>
        </Panel>
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
