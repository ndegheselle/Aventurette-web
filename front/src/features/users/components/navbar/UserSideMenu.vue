<script setup lang="ts">
import { LogInIcon, LogOutIcon, UserIcon } from 'lucide-vue-next';
import { useAuth } from '@features/auth/composables/useAuth';
import { routesNames as authRoutesNames } from '@features/auth/routes';
import { routesNames as userRoutesNames } from '@features/users/routes';
const { isLoggedIn, logout } = useAuth();
</script>

<template>
    <template v-if="isLoggedIn">
        <li class="menu-title">{{ $t('users.account') }}</li>
        <li>
            <RouterLink :to="{ name: userRoutesNames.profil }">
                <UserIcon />{{ $t('profil.title') }}
            </RouterLink>
        </li>
        <li>
            <a @click="logout()">
                <LogOutIcon /> {{ $t('users.logout') }}
            </a>
        </li>
    </template>
    <template v-else>
        <li class="menu-title">{{ $t('users.account') }}</li>
        <li>
            <RouterLink :to="{ name: authRoutesNames.login }">
                <LogInIcon /> {{ $t('users.login.title') }}
            </RouterLink>
        </li>
    </template>
</template>
