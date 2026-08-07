<script setup lang="ts">
import { useAuth } from '@features/auth/composables/useAuth';
import { routesNames as userRoutesNames } from '@features/users/routes';
import { LogInIcon, LogOutIcon, UserIcon } from 'lucide-vue-next';
const { isLoggedIn, logout } = useAuth();
</script>

<template>
    <ul v-if="isLoggedIn">
        <h2 class="menu-title">{{ $t('users.account') }}</h2>
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
    </ul>
    <ul v-else>
        <h2 class="menu-title">{{ $t('users.account') }}</h2>
        <li>
            <RouterLink :to="{ name: userRoutesNames.login }">
                <LogInIcon /> {{ $t('users.login.title') }}
            </RouterLink>
        </li>
    </ul>
</template>