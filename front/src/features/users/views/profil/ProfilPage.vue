<script setup lang="ts">
import { useProfil } from '@features/users/composables/profil';
import type { FamilyData } from '@features/users/data/families';
import { UserProfilType } from '@features/users/data/users';
import FamilyEdit from '@features/users/views/family/FamilyEdit.vue';

const profil = useProfil();
</script>

<template>
    <div class="container mx-auto flex flex-col my-2">
        <FamilyEdit v-if="profil.type.value == UserProfilType.PERSONNAL" :family="(profil.current.value as FamilyData)" />
    </div>
</template>