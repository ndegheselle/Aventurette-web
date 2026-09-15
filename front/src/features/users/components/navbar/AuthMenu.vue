<script setup lang="ts">
import { LogOutIcon } from 'lucide-vue-next';
import { useAuth } from '@features/auth/composables/useAuth';
import { routesNames as authRoutesNames } from '@features/auth/routes';
import Dropdown from '@chapelure/ui/overlays/Dropdown.vue';
import type { UserData } from '@features/users/model/user';

const { isLoggedIn, current, logout } = useAuth<UserData>();
</script>

<template>
    <Dropdown class="dropdown-end" v-if="isLoggedIn">
        <template #summary>
            <summary class="btn btn-circle btn-ghost">
                <div class="avatar">
                    <div class="rounded-full">
                        <img alt="Tailwind-CSS-Avatar-component"
                            src="https://placeholder.pagebee.io/api/plain/32/32" />
                    </div>
                </div>
            </summary>
        </template>
        <ul class="menu p-2 w-40">
            <li class="menu-title">{{ current?.email }}</li>
            <a @click="logout()" class="btn">
                <LogOutIcon /> {{ $t('users.logout') }}
            </a>
        </ul>
    </Dropdown>
    <RouterLink class="btn btn-primary btn-sm" v-else :to="{ name: authRoutesNames.login }">
        {{ $t('users.login.title') }}
    </RouterLink>
</template>