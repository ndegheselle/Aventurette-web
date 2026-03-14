<script setup lang="ts">
import { NotImplementedError } from '@common/utils/dev';
import { useAuth } from '@features/users/composables/auth';
import { userRegisterRoute } from '@features/users/routes';
import LoginProviders from '@features/users/views/LoginProviders.vue';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const router = useRouter();
const { login } = useAuth();

const credentials = reactive({
    email: 'test@example.com',
    password: '1234567890'
});

const error = ref('');
const isLoading = ref(false);

async function onLogin() {
    isLoading.value = true;
    error.value = '';
    try {
        await login(credentials.email, credentials.password);
        router.push('/');
    } catch (e: any) {
        error.value = e.data?.message || t("users.form.error");
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
        <legend class="fieldset-legend">{{ $t('users.login') }}</legend>
        <label class="label" :class="{ 'text-error': !!error }">{{ $t('users.form.email') }}</label>
        <input type="email" class="input" placeholder="Email" :class="{ 'input-error': !!error }"
            v-model="credentials.email" />
        <span class="label" :class="{ 'text-error': !!error }">{{ $t('users.form.password') }}</span>
        <input type="password" class="input" placeholder="Password" :class="{ 'input-error': !!error }"
            v-model="credentials.password" />
        <small class="text-error" v-if="error">
            <i class="fa-solid fa-triangle-exclamation"></i>
            {{ error }}
        </small>

        <label class="label">
            <input type="checkbox" checked="true" class="checkbox" />
            {{ $t('users.form.rememberMe') }}
        </label>

        <div class="divider">{{ $t('users.form.withOauth2') }}</div>
        <LoginProviders @provider-selected="handleProvider" />

        <button class="btn btn-primary mt-4" :disabled="isLoading" @click="onLogin">
            <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
            {{ $t('users.login') }}
        </button>
        <RouterLink :to="{ name: userRegisterRoute }" class="btn btn-ghost">{{ $t('users.form.accountNew') }}
        </RouterLink>
    </fieldset>
</template>