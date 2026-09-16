<!--
  What can be done to one activity from the authoring list: open it, or delete it.

  Deleting is emitted rather than done here — the confirmation and the write belong to the
  screen and its composable, so this stays markup.
-->
<script setup lang="ts">
import Dropdown from '@chapelure/ui/overlays/Dropdown.vue';
import DropdownTrigger from '@chapelure/ui/overlays/DropdownTrigger.vue';
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
                    <TrashIcon class="icon-sm" /> {{ $t('activities.edit.remove') }}
                </a>
            </li>
        </ul>
    </Dropdown>
</template>
