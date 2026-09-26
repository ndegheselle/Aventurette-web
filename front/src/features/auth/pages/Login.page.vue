<script setup lang="ts">
import { NotImplementedError } from '@chapelure/core';
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import PasswordInput from '@chapelure/ui/forms/PasswordInput.vue';
import LoginProviders from '@features/auth/components/LoginProviders.vue';
import { useLoginForm } from '@features/auth/composables/useLoginForm';
import { routesNames } from '@features/auth/routes';
import { MailIcon } from 'lucide-vue-next';

const { credentials, rememberMe, isLoading, errors, submit } = useLoginForm();

function handleProvider(_provider: string) {
    throw new NotImplementedError();
}
</script>

<template>
    <div class="flex flex-1 my-2">
        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 m-auto">
            <legend class="fieldset-legend">{{ $t('auth.login.title') }}</legend>

            <Field label="auth.form.email"
                   :error="errors.get('email')">
                <label class="input"
                       :class="{ 'input-error': !!errors.get('email') }">
                    <MailIcon class="opacity-50" />
                    <input class="grow"
                           v-model="credentials.email" />
                </label>
            </Field>

            <Field label="auth.form.password"
                   :error="errors.get('password')">
                <PasswordInput v-model="credentials.password"
                               :error="!!errors.get('password')" />
            </Field>

            <FieldError :error="errors.global.value" />

            <label class="label">
                <input type="checkbox" class="checkbox" v-model="rememberMe" />
                {{ $t('auth.form.rememberMe') }}
            </label>

            <div class="divider">{{ $t('auth.form.withOauth2') }}</div>
            <LoginProviders @provider-selected="handleProvider" />

            <button class="btn btn-primary mt-4"
                    :disabled="isLoading"
                    @click="submit">
                <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
                {{ $t('auth.login.title') }}
            </button>
            <RouterLink class="btn btn-ghost"
                        :to="{ name: routesNames.register }">
                {{ $t('auth.form.accountNew') }}
            </RouterLink>
        </fieldset>
    </div>
</template>
