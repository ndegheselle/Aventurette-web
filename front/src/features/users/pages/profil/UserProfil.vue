<script setup lang="ts">
import Group from '@chapelure/common/components/layout/Group.vue';
import { useAlert } from '@chapelure/common/composables/popups/useAlert';
import { type InterestData } from '@features/users/composables/data/interests';

const props = defineProps<{ interests?: InterestData[] }>();
const alert = useAlert();

alert.debug("WIP : Ajouter modification adresse mail, changement mot de passe, afficher type de compte.");
</script>

<template>
    <Group>
        <div class="flex items-center gap-4">
            <div class="skeleton h-16 w-16 shrink-0 rounded-full"></div>
            <div class="flex flex-col gap-4">
                <div class="skeleton h-4 w-20"></div>
                <div class="skeleton h-4 w-28"></div>
            </div>
        </div>
    </Group>
</template>