<script setup lang="ts">
import { useAuth } from '@features/users/composables/auth';
import { UserProfilType } from '@features/users/data/users';
import { routesNames } from '@features/users/routes';
import { useRouter } from 'vue-router';

const router = useRouter();
const auth = useAuth();

async function selectType(type: UserProfilType) {
    await auth.update({ type: type });
    router.push({ name: routesNames.profil });
}
</script>

<template>
    <div class="m-auto py-2">
        <h1 class="text-4xl text-center font-semibold mb-4">{{ $t("profil.selection") }}</h1>
        <div class="grid grid-cols-3 gap-2">
            <div class="card bg-base-100 w-64 border border-base-300">
                <figure>
                    <img src="https://placeholder.pagebee.io/api/plain/300/200" class="w-full" />
                </figure>
                <div class="card-body">
                    <h2 class="card-title">{{ $t("profil.personnal.title") }}</h2>
                    <p>{{ $t("profil.personnal.description") }}</p>
                    <div class="card-actions">
                        <button class="btn btn-primary w-full" @click="() => selectType(UserProfilType.PERSONNAL)">
                            {{ $t("actions.select") }}
                        </button>
                    </div>
                </div>
            </div>
            <div class="card bg-base-100 w-64 border border-base-300">
                <figure>
                    <img src="https://placeholder.pagebee.io/api/plain/300/200" class="w-full" />
                </figure>
                <div class="card-body">
                    <h2 class="card-title">{{ $t("profil.association.title") }}</h2>
                    <p>{{ $t("profil.association.description") }}</p>
                    <div class="card-actions">
                        <button class="btn btn-primary w-full" @click="() => selectType(UserProfilType.ASSOCIATION)">
                            {{ $t("actions.select") }}</button>
                    </div>
                </div>
            </div>
            <div class="card bg-base-100 w-64 border border-base-300">
                <figure>
                    <img src="https://placeholder.pagebee.io/api/plain/300/200" class="w-full" />
                </figure>
                <div class="card-body">
                    <h2 class="card-title">{{ $t("profil.school.title") }}</h2>
                    <p>{{ $t("profil.school.description") }}</p>
                    <div class="card-actions">
                        <button class="btn btn-primary w-full" @click="() => selectType(UserProfilType.SCHOOL)">
                            {{ $t("actions.select") }}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>