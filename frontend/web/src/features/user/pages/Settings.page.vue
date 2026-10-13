<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import { useNavbar } from '@chapelure/ui/layout/useNavbar';
import BottomSheet from '@chapelure/ui/modals/BottomSheet.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import { EnumTheme, useSettings } from '@chapelure/ui/settings/useSettings';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ChevronRightIcon, PaletteIcon, LanguagesIcon, LogOutIcon } from 'lucide-vue-next';
import { useLogout } from '@features/user/composables/useLogout';

const { t } = useI18n();
const { currentLanguage, currentTheme, changeTheme, changeLang } = useSettings();
const { logoutToLogin } = useLogout();

const themeSheet = useModal();
const languageSheet = useModal();

const themes = [
    { value: EnumTheme.auto, label: 'settings.themes.auto' },
    { value: EnumTheme.light, label: 'settings.themes.light' },
    { value: EnumTheme.dark, label: 'settings.themes.dark' }
];

const currentThemeLabel = computed(() => themes.find(theme => theme.value === currentTheme.value)?.label);

const languages = [
    { code: 'fr', label: 'Français (France)' },
    { code: 'en', label: 'English (US)' }
];

function pickTheme(theme: EnumTheme) {
    changeTheme(theme);
    themeSheet.cancel();
}

function pickLanguage(code: string) {
    changeLang(code);
    languageSheet.cancel();
}

useNavbar(t('user.settings.title'));
</script>

<template>
    <Container>
        <ul class="menu w-full border border-base-200 bg-base-100 rounded-box p-3 shadow">
            <li class="menu-title">{{ t('user.settings.preferences') }}</li>
            <li>
                <a @click="() => themeSheet.show()">
                    <PaletteIcon />
                    <span>{{ t('user.settings.theme') }}</span>
                    <span v-if="currentThemeLabel"
                        class="font-bold opacity-50">{{ t(currentThemeLabel) }}</span>
                    <ChevronRightIcon />
                </a>
            </li>
            <li>
                <a @click="() => languageSheet.show()">
                    <LanguagesIcon />
                    <span>{{ t('user.settings.language') }}</span>
                    <span class="font-bold uppercase opacity-50">{{ currentLanguage }}</span>
                    <ChevronRightIcon />
                </a>
            </li>
        </ul>
        <button @click="logoutToLogin" class="btn mt-auto flex justify-between">
            <div class="flex gap-2">
                <LogOutIcon />
                <span>{{ t('auth.logout') }}</span>
            </div>
            <ChevronRightIcon />
        </button>

        <BottomSheet :controller="themeSheet">
            <template #title>{{ t('user.settings.theme') }}</template>
            <ul class="menu w-full">
                <li v-for="theme in themes" :key="theme.value">
                    <a :class="{ 'menu-active': theme.value === currentTheme }"
                        @click="() => pickTheme(theme.value)">
                        <!-- A square showing the theme's base colour; auto is cut in two, dark over light. -->
                        <span class="size-5 rounded border border-base-content/20 overflow-hidden relative">
                            <template v-if="theme.value === EnumTheme.auto">
                                <span data-theme="light"
                                    class="absolute inset-0 bg-base-100"></span>
                                <span data-theme="dark"
                                    class="absolute inset-0 bg-base-100"
                                    style="clip-path: polygon(100% 0, 100% 100%, 0 100%)"></span>
                            </template>
                            <span v-else
                                :data-theme="theme.value === EnumTheme.dark ? 'dark' : 'light'"
                                class="absolute inset-0 bg-base-100"></span>
                        </span>
                        {{ t(theme.label) }}
                    </a>
                </li>
            </ul>
        </BottomSheet>

        <BottomSheet :controller="languageSheet">
            <template #title>{{ t('user.settings.language') }}</template>
            <ul class="menu w-full">
                <li v-for="language in languages" :key="language.code">
                    <a :class="{ 'menu-active': language.code === currentLanguage }"
                        @click="() => pickLanguage(language.code)">{{ language.label }}</a>
                </li>
            </ul>
        </BottomSheet>
    </Container>
</template>
