<script setup lang="ts">
import { useAuth } from '@features/users/composables/auth';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

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
        error.value = e.data?.message || 'Login failed';
    } finally {
        isLoading.value = false;
    }
}

</script>

<template>
    <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 mx-auto mt-2 mb-auto">
        <legend class="fieldset-legend text-2xl">{{ $t('users.login') }}</legend>

        <label class="label">{{ $t('users.form.email') }}</label>
        <input type="email" class="input" placeholder="Email" :class="{ 'input-error': !!error }"
            v-model="credentials.email" />

        <span class="label">{{ $t('users.form.password') }}</span>
        <input type="password" class="input" placeholder="Password" :class="{ 'input-error': !!error }"
            v-model="credentials.password" />
        <small class="text-error" v-if="error">
            <i class="fa-solid fa-triangle-exclamation"></i>
            {{ error }}
        </small>


        <button class="btn btn-primary mt-4" :disabled="isLoading" @click="onLogin">
            <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
            {{ $t('users.login') }}
        </button>
    </fieldset>
</template>