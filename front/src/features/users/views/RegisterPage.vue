<script setup lang="ts">
import FormInput from '@common/components/form/FormInput.vue';
import { NotImplementedError, useValidationErrors } from '@common/utils/dev';
import { useAuth } from '@features/users/composables/auth';
import { routesNames } from '@features/users/routes';
import LoginProviders from '@features/users/views/LoginProviders.vue';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const auth = useAuth();
const errors = useValidationErrors();
const router = useRouter();

const credentials = reactive({
    email: 'test@example.com',
    password: '1234567890',
    passwordConfirm: '1234567890'
});

const isLoading = ref(false);

async function onRegister() {
    isLoading.value = true;
    errors.reset();
    try {
        await auth.register(credentials.email, credentials.password, credentials.passwordConfirm);
        router.push({ name: routesNames.profilType });
    } catch (e: any) {
        errors.set(e);
    } finally {
        isLoading.value = false;
    }
}

function handleProvider(provider: string) {
    throw new NotImplementedError();
}
</script>

<template>
    <div class="flex flex-1 my-2">
    <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 m-auto">
        <legend class="fieldset-legend">{{ $t('users.register') }}</legend>

        <FormInput type="email"
                   :label="$t('users.form.email')"
                   v-model="credentials.email"
                   :error="errors.get('email')" />
        <FormInput type="password"
                   :label="$t('users.form.password')"
                   v-model="credentials.password"
                   :error="errors.get('password')" />
        <FormInput type="password"
                   :label="$t('users.form.confirmPassword')"
                   v-model="credentials.passwordConfirm"
                   :error="errors.get('passwordConfirm')" />

        <div class="divider">{{ $t('users.form.withOauth2') }}</div>
        <LoginProviders @provider-selected="handleProvider" />

        <button class="btn btn-primary mt-4"
                :disabled="isLoading"
                @click="onRegister">
            <span v-if="isLoading"
                  class="loading loading-spinner loading-sm"></span>
            {{ $t('users.register') }}
        </button>
        <RouterLink :to="{ name: routesNames.login }"
                    class="btn btn-ghost">{{ $t('users.form.accountAlready') }}
        </RouterLink>
    </fieldset>
    </div>
</template>