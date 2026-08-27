<script setup lang="ts">
import { NotImplementedError } from '@chapelure/core';
import { useValidationErrors } from '@chapelure/ui/composables/useValidationErrors';
import Field from '@chapelure/ui/forms/Field.vue';
import Fieldset from '@chapelure/ui/forms/Fieldset.vue';
import { MailIcon } from 'lucide-vue-next';
import Button from '@chapelure/ui/primitives/Button.vue';
import InputGroup from '@chapelure/ui/primitives/InputGroup.vue';
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
        <Fieldset :legend="$t('users.register')"
                  class="bg-base-200 border-base-300 rounded-box w-xs border p-4 m-auto">

            <Field label="users.form.email"
                   :error="errors.get('email')">
                <InputGroup :error="!!errors.get('email')">
                    <MailIcon class="opacity-50" />
                    <input class="grow"
                           v-model="credentials.email" />
                </InputGroup>
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

            <Button variant="primary"
                    class="mt-4"
                    :loading="isLoading"
                    @click="onRegister">
                {{ $t('users.register') }}
            </Button>
            <Button variant="ghost"
                    :to="{ name: loginRoute }">
                {{ $t('users.form.accountAlready') }}
            </Button>
        </Fieldset>
    </div>
</template>
