<script setup lang="ts">
import { NotImplementedError } from '@chapelure/core';
import Field from '@chapelure/ui/forms/Field.vue';
import PasswordInput from '@chapelure/ui/forms/PasswordInput.vue';
import LoginProviders from '@features/auth/components/LoginProviders.vue';
import { useRegisterForm } from '@features/auth/composables/useRegisterForm';
import { MailIcon } from 'lucide-vue-next';

const { credentials, isLoading, errors, submit } = useRegisterForm();

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
                <PasswordInput v-model="credentials.passwordConfirm"
                               :error="!!errors.get('passwordConfirm')" />
            </Field>

            <div class="divider">{{ $t('users.form.withOauth2') }}</div>
            <LoginProviders @provider-selected="handleProvider" />

            <button class="btn btn-primary mt-4"
                    :disabled="isLoading"
                    @click="submit">
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
