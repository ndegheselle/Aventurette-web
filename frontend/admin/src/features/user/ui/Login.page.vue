<script setup lang="ts">
import { NotImplementedError } from '@chapelure/core';
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import { Button } from '@chapelure/ui/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '@chapelure/ui/shadcn/card';
import { Checkbox } from '@chapelure/ui/shadcn/checkbox';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@chapelure/ui/shadcn/input-group';
import { Label } from '@chapelure/ui/shadcn/label';
import { Separator } from '@chapelure/ui/shadcn/separator';
import { Spinner } from '@chapelure/ui/shadcn/spinner';
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
        <Card class="w-full max-w-xs min-w-0 m-auto gap-4 py-4">
            <CardHeader class="px-4">
                <CardTitle>{{ $t('auth.login.title') }}</CardTitle>
            </CardHeader>

            <CardContent v-if="!codeSent" class="flex flex-col gap-4 px-4">
                <Field label="auth.form.email"
                       :error="requestErrors.get('email')">
                    <InputGroup>
                        <InputGroupAddon>
                            <MailIcon />
                        </InputGroupAddon>
                        <InputGroupInput type="email"
                                         autocomplete="email"
                                         :aria-invalid="!!requestErrors.get('email') || undefined"
                                         v-model="email" />
                    </InputGroup>
                </Field>

                <FieldError :error="requestErrors.global.value" />

                <Label>
                    <Checkbox v-model="rememberMe" />
                    {{ $t('auth.form.rememberMe') }}
                </Label>

                <div class="flex items-center gap-2 text-xs text-muted-foreground">
                    <Separator class="flex-1" />
                    {{ $t('auth.form.withOauth2') }}
                    <Separator class="flex-1" />
                </div>
                <LoginProviders @provider-selected="signInWith" />

                <Button class="mt-2"
                        :disabled="isRequestingCode"
                        @click="requestCode">
                    <Spinner v-if="isRequestingCode" />
                    {{ $t('auth.login.sendCode') }}
                </Button>
            </CardContent>

            <CardContent v-else class="flex flex-col gap-4 px-4">
                <p class="text-sm">{{ $t('auth.login.codeSentTo', { email }) }}</p>

                <Field label="auth.form.code"
                       :error="loginErrors.get('password')">
                    <InputGroup>
                        <InputGroupAddon>
                            <KeyRoundIcon />
                        </InputGroupAddon>
                        <InputGroupInput class="tracking-widest"
                                         inputmode="numeric"
                                         autocomplete="one-time-code"
                                         :aria-invalid="!!loginErrors.get('password') || undefined"
                                         v-model="code" />
                    </InputGroup>
                </Field>

                <FieldError :error="loginErrors.global.value" />

                <div class="mt-2 flex flex-col gap-2">
                    <Button :disabled="isLoggingIn"
                            @click="login">
                        <Spinner v-if="isLoggingIn" />
                        {{ $t('auth.login.title') }}
                    </Button>
                    <Button variant="ghost"
                            @click="changeEmail">
                        {{ $t('auth.login.changeEmail') }}
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
</template>
