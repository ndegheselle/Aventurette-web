<script setup lang="ts">
import { NotImplementedError } from '@chapelure/core';
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import LoginProviders from '@features/user/ui/LoginProviders.vue';
import { useLoginForm } from '@features/user/composables/useLoginForm';
import { KeyRoundIcon, MailIcon } from 'lucide-vue-next';

const {
    email,
    code,
    codeSent,
    rememberMe,
    requestCode,
    isRequestingCode,
    requestErrors,
    login,
    isLoggingIn,
    loginErrors,
    changeEmail,
} = useLoginForm();

function signInWith(_provider: string) {
    throw new NotImplementedError();
}
</script>

<template>
    <div class="flex flex-1 my-2 px-4">
        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-full max-w-xs min-w-0 border p-4 m-auto">
            <legend class="fieldset-legend">{{ $t('auth.login.title') }}</legend>

            <template v-if="!codeSent">
                <Field label="auth.form.email"
                       :error="requestErrors.get('email')">
                    <label class="input"
                           :class="{ 'input-error': !!requestErrors.get('email') }">
                        <MailIcon class="opacity-50" />
                        <input class="grow"
                               type="email"
                               autocomplete="email"
                               v-model="email" />
                    </label>
                </Field>

                <FieldError :error="requestErrors.global.value" />

                <label class="label">
                    <input type="checkbox" class="checkbox" v-model="rememberMe" />
                    {{ $t('auth.form.rememberMe') }}
                </label>

                <div class="divider">{{ $t('auth.form.withOauth2') }}</div>
                <LoginProviders @provider-selected="signInWith" />

                <button class="btn btn-primary mt-4"
                        :disabled="isRequestingCode"
                        @click="requestCode">
                    <span v-if="isRequestingCode" class="loading loading-spinner loading-sm"></span>
                    {{ $t('auth.login.sendCode') }}
                </button>
            </template>

            <template v-else>
                <p class="text-sm">{{ $t('auth.login.codeSentTo', { email }) }}</p>

                <Field label="auth.form.code"
                       :error="loginErrors.get('password')">
                    <label class="input"
                           :class="{ 'input-error': !!loginErrors.get('password') }">
                        <KeyRoundIcon class="opacity-50" />
                        <input class="grow tracking-widest"
                               inputmode="numeric"
                               autocomplete="one-time-code"
                               v-model="code" />
                    </label>
                </Field>

                <FieldError :error="loginErrors.global.value" />

                <button class="btn btn-primary mt-4"
                        :disabled="isLoggingIn"
                        @click="login">
                    <span v-if="isLoggingIn" class="loading loading-spinner loading-sm"></span>
                    {{ $t('auth.login.title') }}
                </button>
                <button class="btn btn-ghost"
                        @click="changeEmail">
                    {{ $t('auth.login.changeEmail') }}
                </button>
            </template>
        </fieldset>
    </div>
</template>
