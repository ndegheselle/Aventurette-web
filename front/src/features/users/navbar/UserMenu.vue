<script setup lang="ts">
import { useAuth } from '@features/users/composables/auth';
import { LogOutIcon, UserIcon } from 'lucide-vue-next';
const { isLoggedIn, user, logout } = useAuth();

</script>

<template>
    <div v-if="isLoggedIn"
         class="dropdown dropdown-end">
        <div tabindex="0"
             role="button"
             class="btn btn-circle avatar">
            <div class="rounded-full text-lg">
                <i class="fa-solid fa-user "></i>
            </div>
        </div>
        <ul tabindex="-1"
            class="menu menu-sm dropdown-content bg-base-200 rounded-box z-1 mt-3 w-52 p-2">
            <li class="menu-title">{{ user?.email }}</li>
            <li>
                <RouterLink to="/user/profil">
                    <i class="fa-solid fa-address-card"></i> {{ $t('users.profil') }}
                </RouterLink>
            </li>
            <li><a @click="logout"><LogOutIcon /> {{ $t('logout') }}</a></li>
        </ul>
    </div>
    <ul v-else
        class="menu menu-horizontal px-1">
        <li>
            <RouterLink to="/user/login"><UserIcon /> {{ $t('users.login') }}</RouterLink>
        </li>
    </ul>
</template>