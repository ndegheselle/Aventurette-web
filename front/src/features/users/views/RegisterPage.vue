<script setup lang="ts">
import { userLoginRoute } from '@features/users/routes';
import LoginProviders from '@features/users/views/LoginProviders.vue';
import { NotImplementedError } from '@common/utils/dev';
import { reactive, ref } from 'vue';
import { useAuth } from '@features/users/composables/auth';
import type { ClientResponseError } from 'pocketbase';

const { register } = useAuth();

const credentials = reactive({
    email: 'test@example.com',
    password: '1234567890',
    passwordConfirm: '1234567890'
});

const error = ref('');
const isLoading = ref(false);

async function onRegister() {
    isLoading.value = true;
    error.value = '';
    try {
        await register(credentials.email, credentials.password, credentials.passwordConfirm);
    } catch (e: any) {
        const clientError = e as ClientResponseError;
        if (clientError) {
            
            error.value = e.data?.message;
        }
    } finally {
        isLoading.value = false;
    }
}

function handleProvider(provider: string) {
    throw new NotImplementedError();
}
</script>

<template>
    <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 m-auto">
        <legend class="fieldset-legend">{{ $t('users.register') }}</legend>

        <label class="label">{{ $t('users.form.email') }}</label>
        <input type="email" class="input" :class="{ 'input-error': !!error }" v-model="credentials.email" />

        <span class="label">{{ $t('users.form.password') }}</span>
        <input type="password" class="input" :class="{ 'input-error': !!error }" v-model="credentials.password" />

        <span class="label">{{ $t('users.form.confirmPassword') }}</span>
        <input type="password" class="input" :class="{ 'input-error': !!error }"
            v-model="credentials.passwordConfirm" />

        <small class="text-error" v-if="error">
            <i class="fa-solid fa-triangle-exclamation"></i>
            {{ error }}
        </small>

        <div class="divider">{{ $t('users.form.withOauth2') }}</div>
        <LoginProviders @provider-selected="handleProvider" />

        <button class="btn btn-primary mt-4" :disabled="isLoading" @click="onRegister">
            <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
            {{ $t('users.register') }}
        </button>
        <RouterLink :to="{ name: userLoginRoute }" class="btn btn-ghost">{{ $t('users.form.accountAlready') }}
        </RouterLink>
    </fieldset>
</template>