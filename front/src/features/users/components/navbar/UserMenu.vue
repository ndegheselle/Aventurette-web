<script setup lang="ts">
import { useAuth } from '@features/users/composables/auth';
import { routesNames } from '@features/users/routes';
import { LogOutIcon, UserPenIcon } from 'lucide-vue-next';

const { isLoggedIn, logout } = useAuth();

</script>

<template>
    <div>
        <div v-if="isLoggedIn" class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-circle">
                <div class="avatar">
                    <div class="rounded-full">
                        <img src="https://placeholder.pagebee.io/api/plain/64/64" />
                    </div>
                </div>
            </div>
            <ul tabindex="-1" class="menu dropdown-content bg-base-200 rounded-box z-1 mt-3 w-52 p-2 shadow">
                <li>
                    <RouterLink to="/user/profil">
                        <UserPenIcon /> {{ $t('profil.title') }}
                    </RouterLink>
                </li>
                <li>
                    <a @click="logout">
                        <LogOutIcon /> {{ $t('users.logout') }}
                    </a>
                </li>
            </ul>
        </div>
        <ul v-else class="menu menu-horizontal p-0">
            <li>
                <RouterLink :to="{ name: routesNames.login }" class="btn">{{ $t('users.login.title') }}</RouterLink>
            </li>
            <li class="ms-1">
                <RouterLink :to="{ name: routesNames.register }" class="btn btn-primary">{{ $t('users.register') }}
                </RouterLink>
            </li>
        </ul>
    </div>
</template>