<script setup lang="ts">
import Group from '@common/components/layout/Group.vue';
import { type InterestData } from '@features/users/data/interests';
const props = defineProps<{ interests?: InterestData[] }>();

import { useAlert } from '@common/composables/popups/alert';
const alert = useAlert();

alert.debug("WIP : Ajouter modification adresse mail, changement mot de passe, afficher type de compte.");
</script>

<template>
    <Group :title="$t('users.title')">
        <div class="flex items-center gap-4">
            <div class="skeleton h-16 w-16 shrink-0 rounded-full"></div>
            <div class="flex flex-col gap-4">
                <div class="skeleton h-4 w-20"></div>
                <div class="skeleton h-4 w-28"></div>
            </div>
        </div>
    </Group>
</template>