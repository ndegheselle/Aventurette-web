<script setup lang="ts">
import { EnumTheme, useSettings } from '@common/composables/settings';
import { PaletteIcon } from 'lucide-vue-next';

const { currentLanguage, changeTheme, changeLang } = useSettings();
</script>

<template>
    <ul class="menu menu-horizontal p-0">
        <li class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-circle btn-ghost">
                <PaletteIcon />
            </div>
            <ul tabindex="-1" class="menu menu-sm dropdown-content w-32 bg-base-200 rounded-box shadow">
                <li class="menu-title">{{ $t("settings.theme") }}</li>
                <li>
                    <a @click="changeTheme(EnumTheme.auto)">
                        <span class="w-4 h-4 rounded border border-base-content/5 overflow-hidden relative">
                            <!-- Light half -->
                            <span data-theme="dark" class="absolute inset-0 bg-base-100"
                                style="clip-path: polygon(0 0, 100% 0, 0 100%)">
                            </span>
                            <!-- Dark half -->
                            <span data-theme="light" class="absolute inset-0 bg-base-100"
                                style="clip-path: polygon(100% 0, 100% 100%, 0 100%)">
                            </span>
                        </span>
                        {{ $t("settings.themes.auto") }}
                    </a>
                </li>
                <li><a @click="changeTheme(EnumTheme.light)"><span data-theme="light"
                            class="w-4 h-4 bg-base rounded border border-base-content/5"></span> {{
                                $t("settings.themes.light") }}</a></li>
                <li><a @click="changeTheme(EnumTheme.dark)"><span data-theme="dark"
                            class="w-4 h-4 bg-base rounded border border-base-content/5"></span> {{
                                $t("settings.themes.dark")
                            }}</a></li>
            </ul>
        </li>
        <li class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-circle btn-ghost uppercase">
                {{ currentLanguage }}
            </div>
            <ul tabindex="-1" class="menu menu-sm dropdown-content w-32 bg-base-200 rounded-box shadow">
                <li class="menu-title">{{ $t("settings.language") }}</li>
                <li>
                    <a @click="changeLang('fr')">Français (France)</a>
                </li>
                <li>
                    <a @click="changeLang('eng')">English (US)</a>
                </li>
            </ul>
        </li>
    </ul>
</template>