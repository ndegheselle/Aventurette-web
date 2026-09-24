<!--
  Row actions on the authoring list: open an activity, or delete it. Deleting is emitted — the
  confirmation and the write belong to the screen.
-->
<script setup lang="ts">
import Dropdown from '@chapelure/ui/dropdown/Dropdown.vue';
import DropdownTrigger from '@chapelure/ui/dropdown/DropdownTrigger.vue';
import { routesNames } from '@features/activities-authoring/routes';
import { EllipsisVerticalIcon, PenIcon, TrashIcon } from 'lucide-vue-next';

const { id } = defineProps<{ id: string }>();

const emit = defineEmits<{ remove: [] }>();
</script>

<template>
    <Dropdown class="dropdown-end my-auto">
        <template #summary>
            <DropdownTrigger>
                <EllipsisVerticalIcon />
            </DropdownTrigger>
        </template>
        <ul class="menu p-2 w-44">
            <li>
                <RouterLink :to="{ name: routesNames.page, params: { id } }">
                    <PenIcon class="icon-sm" /> {{ $t('actions.update') }}
                </RouterLink>
            </li>
            <li>
                <a class="text-error" @click="emit('remove')">
                    <TrashIcon class="icon-sm" /> {{ $t('activities.authoring.remove') }}
                </a>
            </li>
        </ul>
    </Dropdown>
</template>
