<script setup lang="ts">
import { NotImplementedError } from '@chapelure/core';
import { useValidationErrors } from '@chapelure/ui/composables/useValidationErrors';
import Field from '@chapelure/ui/forms/Field.vue';
import { MailIcon } from 'lucide-vue-next';
import PasswordInput from '@chapelure/ui/primitives/PasswordInput.vue';
import LoginProviders from '@features/auth/components/LoginProviders.vue';
import { useAuth } from '@features/auth/composables/useAuth';
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

const { loginRoute } = defineProps<{
    loginRoute: string;
}>();
</script>

<template>
    <div class="flex flex-1 my-2">
        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 m-auto">
            <legend class="fieldset-legend">{{ $t('users.register') }}</legend>

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
            <Field label="users.form.confirmPassword"
                   :error="errors.get('passwordConfirm')">
                <!-- was bound to credentials.password, so typing here edited the password -->
                <PasswordInput v-model="credentials.passwordConfirm"
                               :error="!!errors.get('passwordConfirm')" />
            </Field>

            <div class="divider">{{ $t('users.form.withOauth2') }}</div>
            <LoginProviders @provider-selected="handleProvider" />

            <button class="btn btn-primary mt-4"
                    :disabled="isLoading"
                    @click="onRegister">
                <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
                {{ $t('users.register') }}
            </button>
            <RouterLink class="btn btn-ghost"
                        :to="{ name: loginRoute }">
                {{ $t('users.form.accountAlready') }}
            </RouterLink>
        </fieldset>
    </div>
</template>
