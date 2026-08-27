<script setup lang="ts">
import { benefitsRepository as benefits } from '@features/activities/data/benefits.repository';
import Field from '@chapelure/ui/forms/Field.vue';
import TagSelect from '@chapelure/ui/data/TagSelect.vue';
import FilesInput from '@chapelure/ui/files/FilesInput.vue';
import FilesList from '@chapelure/ui/files/FilesList.vue';
import { useOneFile } from '@chapelure/ui/files/useFiles';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-vue-next';
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import Button from '@chapelure/ui/primitives/Button.vue';
import Select from '@chapelure/ui/primitives/Select.vue';
import TextInput from '@chapelure/ui/primitives/TextInput.vue';
import EditSteps from '@features/activities/components/EditSteps.vue';
import type { ActivityData } from '@features/activities/model/activity';
import { type BenefitData } from '@features/activities/model/benefit';
import { availablesEnvironments } from '@features/activities/model/environment';
import { routesNames } from '@features/activities/routes';
import { onMounted, ref } from 'vue';

const availableBenefits = ref<BenefitData[]>([]);
const { files, update: updateImage } = useOneFile();

// XXX : these inputs are not bound to `activity` yet, and the flow has no save step.
defineProps<{
    activity: ActivityData;
}>();

onMounted(async () => {
    availableBenefits.value = await benefits.getAll();
});
</script>

<template>
    <Container>
        <EditSteps current="properties" />

        <Panel class="flex-1">
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
                        <TextInput type="number" />
                    </div>
                    <div>
                        <span class="text-sm opacity-50">{{ $t('data.maximum') }}</span>
                        <TextInput type="number" />
                    </div>
                </div>
            </Field>
            <div class="grid grid-cols-2 gap-2">
                <Field label="activities.fields.environment">
                    <Select>
                        <option v-for="env in availablesEnvironments" :key="env.value" :value="env.value">
                            {{ $t(env.label) }}
                        </option>
                    </Select>
                </Field>
                <Field label="activities.fields.durationMinutes">
                    <TextInput type="number" />
                </Field>
            </div>
            <Field label="activities.fields.benefits">
                <TagSelect :items="availableBenefits" display-key="name" />
            </Field>
        </Panel>

        <div class="mt-auto flex">
            <Button :to="{ name: routesNames.edit.steps }">
                <ArrowLeftIcon />
                {{ $t('actions.previous') }}
            </Button>
            <Button variant="primary" class="ms-auto" :to="{ name: routesNames.edit.properties }">
                <ArrowRightIcon />
                {{ $t('actions.create') }}
            </Button>
        </div>
    </Container>
</template>
