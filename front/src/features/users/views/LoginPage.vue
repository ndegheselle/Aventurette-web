<script setup lang="ts">
import FormInput from '@common/components/data/FormInput.vue';
import { NotImplementedError, useValidationErrors } from '@common/utils/dev';
import { useAuth } from '@features/users/composables/auth';
import { userRegisterRoute } from '@features/users/routes';
import LoginProviders from '@features/users/views/LoginProviders.vue';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const { errors, getError, setErrors } = useValidationErrors();

const router = useRouter();
const { login } = useAuth();

const credentials = reactive({
    email: 'test@example.com',
    password: '1234567890'
});

const isLoading = ref(false);

async function onLogin() {
    isLoading.value = true;
    errors.value = null;
    try {
        await login(credentials.email, credentials.password);
        router.push('/');
    } catch (e: any) {
        setErrors(e);
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
            <legend class="fieldset-legend">{{ $t('users.login') }}</legend>

            <FormInput type="email"
                       :label="$t('users.form.email')"
                       v-model="credentials.email"
                       :error="getError('email')" />
            <FormInput type="password"
                       :label="$t('users.form.password')"
                       v-model="credentials.password"
                       :error="getError('password')" />

            <label class="label">
                <input type="checkbox"
                       checked="true"
                       class="checkbox" />
                {{ $t('users.form.rememberMe') }}
            </label>

            <div class="divider">{{ $t('users.form.withOauth2') }}</div>
            <LoginProviders @provider-selected="handleProvider" />

            <button class="btn btn-primary mt-4"
                    :disabled="isLoading"
                    @click="onLogin">
                <span v-if="isLoading"
                      class="loading loading-spinner loading-sm"></span>
                {{ $t('users.login') }}
            </button>
            <RouterLink :to="{ name: userRegisterRoute }"
                        class="btn btn-ghost">{{ $t('users.form.accountNew') }}
            </RouterLink>
        </fieldset>
    </div>
</template>