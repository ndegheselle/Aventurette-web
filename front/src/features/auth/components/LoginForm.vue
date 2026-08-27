<script setup lang="ts">
import { NotImplementedError } from '@chapelure/core';
import { useValidationErrors } from '@chapelure/ui/composables/useValidationErrors';
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import { MailIcon } from 'lucide-vue-next';
import PasswordInput from '@chapelure/ui/primitives/PasswordInput.vue';
import LoginProviders from '@features/auth/components/LoginProviders.vue';
import { useAuth } from '@features/auth/composables/useAuth';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const errors = useValidationErrors("users.login.defaultError");

const router = useRouter();
const auth = useAuth();

const credentials = reactive({
    email: 'test@example.com',
    password: '1234567890'
});
const rememberMe = ref(true);

const isLoading = ref(false);

async function onLogin() {
    isLoading.value = true;
    errors.reset()
    try {
        await auth.login(credentials.email, credentials.password);
        router.push('/');
    } catch (e: any) {
        errors.set(e);
    } finally {
        isLoading.value = false;
    }
}

function handleProvider(_provider: string) {
    throw new NotImplementedError();
}

const { registerRoute } = defineProps<{
    registerRoute: string;
}>();
</script>

<template>
    <div class="flex flex-1 my-2">

        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 m-auto">
            <legend class="fieldset-legend">{{ $t('users.login.title') }}</legend>

            <Field label="users.form.email"
                   :error="errors.get('email')">
                <label class="input"
                       :class="{ 'input-error': !!errors.get('email') }">
                    <MailIcon class="opacity-50" />
                    <input class="grow"
                           v-model="credentials.email" />
                </label>
            </Field>

            <Field label="users.form.password"
                   :error="errors.get('password')">
                <PasswordInput v-model="credentials.password"
                               :error="!!errors.get('password')" />
            </Field>

            <FieldError :error="errors.global.value" />

            <label class="label">
                <input type="checkbox" class="checkbox" v-model="rememberMe" />
                {{ $t('users.form.rememberMe') }}
            </label>

            <div class="divider">{{ $t('users.form.withOauth2') }}</div>
            <LoginProviders @provider-selected="handleProvider" />

            <button class="btn btn-primary mt-4"
                    :disabled="isLoading"
                    @click="onLogin">
                <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
                {{ $t('users.login.title') }}
            </button>
            <RouterLink class="btn btn-ghost"
                        :to="{ name: registerRoute }">
                {{ $t('users.form.accountNew') }}
            </RouterLink>
        </fieldset>
    </div>
</template>
