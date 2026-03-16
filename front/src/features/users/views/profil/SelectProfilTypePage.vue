<script setup lang="ts">
import { UsersTypeOptions } from '@common/database/types.g';
import { userProfilFamilyRoute } from '@features/users/routes';
import { useRouter } from 'vue-router';

const router = useRouter();
function selectType(type: UsersTypeOptions) {
    router.push({ name: userProfilFamilyRoute });
}
</script>

<template>
    <div class="m-auto">
        <h1 class="text-4xl text-center font-semibold mb-4">{{ $t("profil.selection") }}</h1>
        <div class="grid grid-cols-3 gap-2">
            <div class="card bg-base-100 w-64 shadow-sm">
                <figure>
                    <img src="https://placehold.co/200x160"
                         class="w-full" />
                </figure>
                <div class="card-body">
                    <h2 class="card-title">{{ $t("profil.family.title") }}</h2>
                    <p>{{ $t("profil.family.description") }}</p>
                    <div class="card-actions">
                        <button class="btn btn-primary w-full"
                                @click="() => selectType(UsersTypeOptions.FAMILY)">
                            {{ $t("actions.select") }}
                        </button>
                    </div>
                </div>
            </div>
            <div class="card bg-base-100 w-64 shadow-sm">
                <figure>
                    <img src="https://placehold.co/200x160"
                         class="w-full" />
                </figure>
                <div class="card-body">
                    <h2 class="card-title">{{ $t("profil.association.title") }}</h2>
                    <p>{{ $t("profil.association.description") }}</p>
                    <div class="card-actions">
                        <button class="btn btn-primary w-full"
                                @click="() => selectType(UsersTypeOptions.ASSOCIATION)">
                            {{ $t("actions.select") }}</button>
                    </div>
                </div>
            </div>
            <div class="card bg-base-100 w-64 shadow-sm">
                <figure>
                    <img src="https://placehold.co/200x160"
                         class="w-full" />
                </figure>
                <div class="card-body">
                    <h2 class="card-title">{{ $t("profil.school.title") }}</h2>
                    <p>{{ $t("profil.school.description") }}</p>
                    <div class="card-actions">
                        <button class="btn btn-primary w-full"
                                @click="() => selectType(UsersTypeOptions.SCHOOL)">
                            {{ $t("actions.select") }}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>