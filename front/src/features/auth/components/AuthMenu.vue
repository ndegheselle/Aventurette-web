<script setup lang="ts">
import { routesNames as userRoutesNames } from '@features/user/routes';
import { LogOutIcon, SettingsIcon } from 'lucide-vue-next';
import { useAuth } from '@features/auth/composables/useAuth';
import { routesNames as authRoutesNames } from '@features/auth/routes';
import Dropdown from '@chapelure/ui/dropdown/Dropdown.vue';
import { useRouter } from 'vue-router';

const { isLoggedIn, current, logout } = useAuth();
const router = useRouter();

function logoutToLogin() {
    logout();
    router.push({ name: authRoutesNames.login });
}
</script>

<template>
    <Dropdown class="dropdown-end" v-if="isLoggedIn">
        <template #summary>
            <summary class="btn btn-circle btn-ghost">
                <div class="avatar">
                    <div class="rounded-full">
                        <img alt=""
                            src="https://placeholder.pagebee.io/api/plain/32/32" />
                    </div>
                </div>
            </summary>
        </template>
        <ul class="menu p-2 w-40">
            <li class="menu-title">{{ current?.email }}</li>
            <RouterLink class="btn btn-ghost mb-1" :to="{ name: userRoutesNames.settings }">
                <SettingsIcon /> {{ $t('user.settings.title') }}
            </RouterLink>
            <a @click="logoutToLogin" class="btn">
                <LogOutIcon /> {{ $t('auth.logout') }}
            </a>
        </ul>
    </Dropdown>
    <RouterLink class="btn btn-primary btn-sm" v-else :to="{ name: authRoutesNames.login }">
        {{ $t('auth.login.title') }}
    </RouterLink>
</template>