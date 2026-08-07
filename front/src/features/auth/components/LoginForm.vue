<script setup lang="ts">
import { NotImplementedError } from '@chapelure/core';
import { useValidationErrors } from '@chapelure/ui/composables/useValidationErrors';
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import Fieldset from '@chapelure/ui/forms/Fieldset.vue';
import Label from '@chapelure/ui/forms/Label.vue';
import { MailIcon } from '@chapelure/ui/icons';
import Divider from '@chapelure/ui/layout/Divider.vue';
import Button from '@chapelure/ui/primitives/Button.vue';
import Checkbox from '@chapelure/ui/primitives/Checkbox.vue';
import InputGroup from '@chapelure/ui/primitives/InputGroup.vue';
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

        <Fieldset :legend="$t('users.login.title')"
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

            <FieldError :error="errors.global.value" />

            <Label>
                <Checkbox v-model="rememberMe" />
                {{ $t('users.form.rememberMe') }}
            </Label>

            <Divider>{{ $t('users.form.withOauth2') }}</Divider>
            <LoginProviders @provider-selected="handleProvider" />

            <Button variant="primary"
                    class="mt-4"
                    :loading="isLoading"
                    @click="onLogin">
                {{ $t('users.login.title') }}
            </Button>
            <Button variant="ghost"
                    :to="{ name: registerRoute }">
                {{ $t('users.form.accountNew') }}
            </Button>
        </Fieldset>
    </div>
</template>
