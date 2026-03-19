<script setup lang="ts">
import FieldLabel from '@common/components/form/FieldLabel.vue';
import { NotImplementedError, useValidationErrors } from '@common/utils/dev';
import { useAuth } from '@features/users/composables/auth';
import { routesNames } from '@features/users/routes';
import LoginProviders from '@features/users/views/LoginProviders.vue';
import { EyeClosedIcon, EyeIcon, KeyRoundIcon, MailIcon } from 'lucide-vue-next';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const auth = useAuth();
const errors = useValidationErrors();
const router = useRouter();

const showPassword = ref(false);
const showPasswordConfirm = ref(false);
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
        router.push({ name: routesNames.profilType });
    } catch (e: any) {
        errors.set(e);
    } finally {
        isLoading.value = false;
    }
}

function handleProvider(provider: string) {
    throw new NotImplementedError();
}
</script>

<template>
    <div class="flex flex-1 my-2">
        <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4 m-auto">
            <legend class="fieldset-legend">{{ $t('users.register') }}</legend>

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
                    <button class="btn btn-ghost btn-circle absolute right-1 btn-sm"
                            @click="showPassword = !showPassword">
                        <EyeIcon v-if="showPassword" />
                        <EyeClosedIcon v-else />
                    </button>
                </label>
            </FieldLabel>
            <FieldLabel label="users.form.confirmPassword"
                        :error="errors.get('passwordConfirm')">
                <label class="input">
                    <KeyRoundIcon class="opacity-50" />
                    <input class="grow"
                           :type="showPasswordConfirm ? 'text' : 'password'"
                           v-model="credentials.password"
                           :class="{ 'input-error': errors.get('passwordConfirm') }" />
                    <button class="btn btn-ghost btn-circle absolute right-1 btn-sm"
                            @click="showPasswordConfirm = !showPasswordConfirm">
                        <EyeIcon v-if="showPasswordConfirm" />
                        <EyeClosedIcon v-else />
                    </button>
                </label>
            </FieldLabel>

            <div class="divider">{{ $t('users.form.withOauth2') }}</div>
            <LoginProviders @provider-selected="handleProvider" />

            <button class="btn btn-primary mt-4"
                    :disabled="isLoading"
                    @click="onRegister">
                <span v-if="isLoading"
                      class="loading loading-spinner loading-sm"></span>
                {{ $t('users.register') }}
            </button>
            <RouterLink :to="{ name: routesNames.login }"
                        class="btn btn-ghost">{{ $t('users.form.accountAlready') }}
            </RouterLink>
        </fieldset>
    </div>
</template>