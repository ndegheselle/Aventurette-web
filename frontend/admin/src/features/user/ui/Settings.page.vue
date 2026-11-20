<!-- The settings' menu. A section is a child route: a page of its own on a phone, beside the menu on a desktop. -->
<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import { useIsMobile } from '@chapelure/ui/layout/useIsMobile';
import { useNavbar } from '@chapelure/ui/layout/useNavbar';
import ResponsiveModal from '@chapelure/ui/modals/ResponsiveModal.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import { EnumTheme, useSettings } from '@chapelure/ui/settings/useSettings';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ChevronRightIcon, PaletteIcon, LanguagesIcon, LogOutIcon, UserIcon, UsersIcon } from 'lucide-vue-next';
import { useLogout } from '@features/user/composables/useLogout';
import { routesNames } from '@features/user/routes';
import { useRoute } from 'vue-router';

const { t } = useI18n();
const { currentLanguage, currentTheme, changeTheme, changeLang } = useSettings();
const { logoutToLogin } = useLogout();
const { isMobile } = useIsMobile();
const route = useRoute();

/** Whether a section is open, rather than the menu alone. */
const inSection = computed(() => route.name !== routesNames.settings);

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
    <Container class="p-2 md:grid md:grid-cols-[20rem_1fr] md:items-start md:gap-4">
        <!-- On a phone an open section takes the whole page; on a desktop it shows beside the menu. -->
        <div v-if="!isMobile || !inSection">
            <h1 class="font-title text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{{ t('user.settings.title') }}</h1>
            <ul class="menu w-full border border-base-300 bg-base-200 rounded-box p-3 shadow">
                <li class="menu-title">{{ t('user.settings.preferences') }}</li>
                <li>
                    <a @click="() => themeSheet.show()">
                        <PaletteIcon />
                        <span>{{ t('user.settings.theme') }}</span>
                        <span v-if="currentThemeLabel"
                            class="opacity-50">{{ t(currentThemeLabel) }}</span>
                        <ChevronRightIcon />
                    </a>
                </li>
                <li>
                    <a @click="() => languageSheet.show()">
                        <LanguagesIcon />
                        <span>{{ t('user.settings.language') }}</span>
                        <span class="uppercase opacity-50">{{ currentLanguage }}</span>
                        <ChevronRightIcon />
                    </a>
                </li>
            </ul>
            <ul class="menu w-full border border-base-300 bg-base-200 rounded-box p-3 shadow mt-2">
                <li class="menu-title">{{ t('user.settings.account') }}</li>
                <li>
                    <RouterLink :to="{ name: routesNames.profile }" active-class="menu-active">
                        <UserIcon />
                        <span>{{ t('user.settings.profile') }}</span>
                        <ChevronRightIcon />
                    </RouterLink>
                </li>
                <li class="menu-disabled">
                    <a>
                        <UsersIcon />
                        <span>{{ t('user.settings.children') }}</span>
                        <ChevronRightIcon />
                    </a>
                </li>
                <li>
                    <a @click="logoutToLogin">
                        <LogOutIcon />
                        <span>{{ t('auth.logout') }}</span>
                        <ChevronRightIcon />
                    </a>
                </li>
            </ul>
        </div>

        <RouterView v-if="inSection" />
        <p v-else-if="!isMobile" class="p-8 text-center opacity-70">{{ t('user.settings.pickSection') }}</p>

        <ResponsiveModal :controller="themeSheet">
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
        </ResponsiveModal>

        <ResponsiveModal :controller="languageSheet">
            <template #title>{{ t('user.settings.language') }}</template>
            <ul class="menu w-full">
                <li v-for="language in languages" :key="language.code">
                    <a :class="{ 'menu-active': language.code === currentLanguage }"
                        @click="() => pickLanguage(language.code)">{{ language.label }}</a>
                </li>
            </ul>
        </ResponsiveModal>
    </Container>
</template>
