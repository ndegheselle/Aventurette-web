<script setup lang="ts">
import LoginProviders from '@features/auth/components/LoginProviders.vue';
import { useAuth } from '@features/auth/composables/useAuth';
import FieldError from '@chapelure/common/components/form/FieldError.vue';
import FieldLabel from '@chapelure/common/components/form/FieldLabel.vue';
import { useValidationErrors } from '@chapelure/common/utils/dev';
import { NotImplementedError } from '@chapelure/core';
import { EyeClosedIcon, EyeIcon, KeyRoundIcon, MailIcon } from 'lucide-vue-next';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const errors = useValidationErrors("users.login.defaultError");

const router = useRouter();
const auth = useAuth();
const showPassword = ref(false);

const credentials = reactive({
    email: 'test@example.com',
    password: '1234567890'
});

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

const props = defineProps<{
    registerRoute: string;
}>();
</script>

<template>
    <div class="flex flex-1 my-2">

        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 m-auto">
            <legend class="fieldset-legend">{{ $t('users.login.title') }}</legend>

            <FieldLabel label="users.form.email"
                        :error="errors.get('email')">
                <label class="input">
                    <MailIcon class="opacity-50" />
                    <input class="grow"
                           v-model="credentials.email"
                           :class="{ 'input-error': errors.get('email') }" />
                </label>
            </FieldLabel>

            <FieldLabel label="users.form.password"
                        :error="errors.get('password')">
                <label class="input">
                    <KeyRoundIcon class="opacity-50" />
                    <input class="grow"
                           :type="showPassword ? 'text' : 'password'"
                           v-model="credentials.password"
                           :class="{ 'input-error': errors.get('password') }" />
                    <button class="btn btn-ghost btn-circle absolute right-1 btn-sm" @click="showPassword = !showPassword">
                        <EyeIcon v-if="showPassword" />
                        <EyeClosedIcon v-else />
                    </button>
                </label>
            </FieldLabel>

            <FieldError :error="errors.global.value" />

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
                {{ $t('users.login.title') }}
            </button>
            <RouterLink :to="{ name: registerRoute }"
                        class="btn btn-ghost">{{ $t('users.form.accountNew') }}
            </RouterLink>
        </fieldset>
    </div>
</template>