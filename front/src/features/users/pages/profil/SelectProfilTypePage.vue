<script setup lang="ts">
import { useUsers } from '@features/users/composables/useUsers';
import { UserProfilType } from '@features/users/model/user';
import { routesNames } from '@features/users/routes';
import { useRouter } from 'vue-router';

const router = useRouter();
const users = useUsers();

const profilTypes = [
    { type: UserProfilType.PERSONNAL, key: 'personnal' },
    { type: UserProfilType.ASSOCIATION, key: 'association' },
    { type: UserProfilType.SCHOOL, key: 'school' },
] as const;

async function selectType(type: UserProfilType) {
    await users.update({ type });
    router.push({ name: routesNames.profil });
}
</script>

<template>
    <div class="m-auto py-2">
        <h1 class="text-4xl text-center font-semibold mb-4">{{ $t("profil.selection") }}</h1>
        <div class="grid grid-cols-3 gap-2">
            <div v-for="profil in profilTypes"
                 :key="profil.key"
                 class="card bg-base-100 border border-base-300 w-64">
                <figure>
                    <img src="https://placeholder.pagebee.io/api/plain/300/200" class="w-full" />
                </figure>
                <div class="card-body">
                    <h2 class="card-title">{{ $t(`profil.${profil.key}.title`) }}</h2>
                    <p>{{ $t(`profil.${profil.key}.description`) }}</p>
                    <div class="card-actions">
                        <button class="btn btn-primary w-full" @click="() => selectType(profil.type)">
                            {{ $t("actions.select") }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
