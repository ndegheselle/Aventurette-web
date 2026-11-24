<script setup lang="ts">
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import { Button } from '@chapelure/ui/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '@chapelure/ui/shadcn/card';
import { Checkbox } from '@chapelure/ui/shadcn/checkbox';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@chapelure/ui/shadcn/input-group';
import { Label } from '@chapelure/ui/shadcn/label';
import { Spinner } from '@chapelure/ui/shadcn/spinner';
import { useLoginForm } from '@features/user/composables/useLoginForm';
import { KeyRoundIcon, LockIcon, MailIcon } from 'lucide-vue-next';

const {
    email,
    password,
    code,
    codeSent,
    unverified,
    rememberMe,
    isBusy,
    requestCode,
    requestErrors,
    loginWithPassword,
    passwordErrors,
    login,
    loginErrors,
    changeEmail,
} = useLoginForm();
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
                                         v-model="email"
                                         @keydown.enter="requestCode" />
                    </InputGroup>
                </Field>

                <FieldError :error="requestErrors.global.value" />

                <Field label="auth.form.password"
                       :error="passwordErrors.global.value">
                    <InputGroup>
                        <InputGroupAddon>
                            <LockIcon />
                        </InputGroupAddon>
                        <InputGroupInput type="password"
                                         autocomplete="current-password"
                                         :aria-invalid="!!passwordErrors.global.value || undefined"
                                         v-model="password"
                                         @keydown.enter="loginWithPassword" />
                    </InputGroup>
                </Field>

                <Label>
                    <Checkbox v-model="rememberMe" />
                    {{ $t('auth.form.rememberMe') }}
                </Label>

                <div class="mt-2 flex flex-col gap-2">
                    <Button variant="outline"
                            :disabled="isBusy"
                            @click="loginWithPassword">
                        <Spinner v-if="isBusy" />
                        {{ $t('auth.login.withPassword') }}
                    </Button>
                    <Button size="lg"
                            :disabled="isBusy"
                            @click="requestCode">
                        <Spinner v-if="isBusy" />
                        {{ $t('auth.login.sendCode') }}
                    </Button>
                </div>
            </CardContent>

            <CardContent v-else class="flex flex-col gap-4 px-4">
                <p v-if="unverified" class="text-sm font-medium">{{ $t('auth.login.emailNotVerified') }}</p>
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
                                         v-model="code"
                                         @keydown.enter="login" />
                    </InputGroup>
                </Field>

                <FieldError :error="loginErrors.global.value" />

                <div class="mt-2 flex flex-col gap-2">
                    <Button size="lg"
                            :disabled="isBusy"
                            @click="login">
                        <Spinner v-if="isBusy" />
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
