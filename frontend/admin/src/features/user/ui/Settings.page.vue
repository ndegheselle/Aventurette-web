<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import { useNavbar } from '@chapelure/ui/layout/useNavbar';
import ResponsiveModal from '@chapelure/ui/modals/ResponsiveModal.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import { EnumTheme, useSettings } from '@chapelure/ui/settings/useSettings';
import { Button } from '@chapelure/ui/shadcn/button';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ChevronRightIcon, PaletteIcon, LanguagesIcon, LogOutIcon, UsersIcon } from 'lucide-vue-next';
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
    <Container class="p-2">
        <div class="max-w-80">
            <h1 class="font-title text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{{ t('user.settings.title') }}</h1>
            <nav class="flex flex-col gap-1 rounded-xl border bg-card p-3 text-card-foreground shadow-sm">
                <h2 class="px-3 py-1.5 text-xs font-medium text-muted-foreground">{{ t('user.settings.preferences') }}</h2>
                <Button variant="ghost" class="w-full justify-start" @click="() => themeSheet.show()">
                    <PaletteIcon />
                    <span class="flex-1 text-start">{{ t('user.settings.theme') }}</span>
                    <span v-if="currentThemeLabel"
                        class="text-muted-foreground">{{ t(currentThemeLabel) }}</span>
                    <ChevronRightIcon class="text-muted-foreground" />
                </Button>
                <Button variant="ghost" class="w-full justify-start" @click="() => languageSheet.show()">
                    <LanguagesIcon />
                    <span class="flex-1 text-start">{{ t('user.settings.language') }}</span>
                    <span class="uppercase text-muted-foreground">{{ currentLanguage }}</span>
                    <ChevronRightIcon class="text-muted-foreground" />
                </Button>
            </nav>
            <nav class="flex flex-col gap-1 rounded-xl border bg-card p-3 text-card-foreground shadow-sm mt-2">
                <h2 class="px-3 py-1.5 text-xs font-medium text-muted-foreground">{{ t('user.settings.account') }}</h2>
                <Button variant="ghost" class="w-full justify-start" disabled>
                    <UsersIcon />
                    <span class="flex-1 text-start">{{ t('user.settings.children') }}</span>
                    <ChevronRightIcon class="text-muted-foreground" />
                </Button>
                <Button variant="ghost" class="w-full justify-start" @click="logoutToLogin">
                    <LogOutIcon />
                    <span class="flex-1 text-start">{{ t('auth.logout') }}</span>
                    <ChevronRightIcon class="text-muted-foreground" />
                </Button>
            </nav>
        </div>


        <ResponsiveModal :controller="themeSheet">
            <template #title>{{ t('user.settings.theme') }}</template>
            <div class="flex flex-col gap-1">
                <Button v-for="theme in themes" :key="theme.value"
                    :variant="theme.value === currentTheme ? 'secondary' : 'ghost'"
                    class="w-full justify-start"
                    @click="() => pickTheme(theme.value)">
                    <!-- A square showing the theme's base colour; auto is cut in two, dark over light.
                         The `.light` / `.dark` class scopes that theme's palette to the span it is on. -->
                    <span class="relative size-5 overflow-hidden rounded border">
                        <template v-if="theme.value === EnumTheme.auto">
                            <span class="light absolute inset-0 bg-background"></span>
                            <span class="dark absolute inset-0 bg-background"
                                style="clip-path: polygon(100% 0, 100% 100%, 0 100%)"></span>
                        </template>
                        <span v-else
                            :class="theme.value === EnumTheme.dark ? 'dark' : 'light'"
                            class="absolute inset-0 bg-background"></span>
                    </span>
                    {{ t(theme.label) }}
                </Button>
            </div>
        </ResponsiveModal>

        <ResponsiveModal :controller="languageSheet">
            <template #title>{{ t('user.settings.language') }}</template>
            <div class="flex flex-col gap-1">
                <Button v-for="language in languages" :key="language.code"
                    :variant="language.code === currentLanguage ? 'secondary' : 'ghost'"
                    class="w-full justify-start"
                    @click="() => pickLanguage(language.code)">
                    {{ language.label }}
                </Button>
            </div>
        </ResponsiveModal>
    </Container>
</template>
