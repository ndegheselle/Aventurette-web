<script setup lang="ts">
import Card from '@chapelure/ui/layout/Card.vue';
import Button from '@chapelure/ui/primitives/Button.vue';
import { UserProfilType, useUsers } from '@features/users/composables/data/users';
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
            <Card v-for="profil in profilTypes"
                  :key="profil.key"
                  :title="$t(`profil.${profil.key}.title`)"
                  class="w-64">
                <template #media>
                    <img src="https://placeholder.pagebee.io/api/plain/300/200" class="w-full" />
                </template>
                <p>{{ $t(`profil.${profil.key}.description`) }}</p>
                <template #actions>
                    <Button variant="primary" block @click="() => selectType(profil.type)">
                        {{ $t("actions.select") }}
                    </Button>
                </template>
            </Card>
        </div>
    </div>
</template>
