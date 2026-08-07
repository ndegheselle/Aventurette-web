<script setup lang="ts">
import Dropdown from '@chapelure/common/components/popups/Dropdown.vue';
import { EnumTheme, useSettings } from '@chapelure/common/composables/settings';
import { PaletteIcon } from 'lucide-vue-next';

const { currentLanguage, changeTheme, changeLang } = useSettings();
</script>

<template>
    <ul>
        <Dropdown class="dropdown-end">
            <template #summary>
                <summary class="btn btn-circle btn-ghost">
                    <PaletteIcon />
                </summary>
            </template>
            <ul class="menu p-2">
                <li class="menu-title">{{ $t("settings.theme") }}</li>
                <li>
                    <a @click="changeTheme(EnumTheme.auto)">
                        <span class="w-4 h-4 rounded border border-base-content/5 overflow-hidden relative">
                            <!-- Light half -->
                            <span data-theme="dark"
                                  class="absolute inset-0 bg-base-100"
                                  style="clip-path: polygon(0 0, 100% 0, 0 100%)">
                            </span>
                            <!-- Dark half -->
                            <span data-theme="light"
                                  class="absolute inset-0 bg-base-100"
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
        </Dropdown>
        <Dropdown class="dropdown-end">
            <template #summary>
                <summary class="btn btn-circle btn-ghost uppercase">
                    {{ currentLanguage }}
                </summary>
            </template>
            <ul class="menu p-2 w-40">
                <li class="menu-title">{{ $t("settings.language") }}</li>
                <li>
                    <a @click="changeLang('fr')">Français (France)</a>
                </li>
                <li>
                    <a @click="changeLang('eng')">English (US)</a>
                </li>
            </ul>
        </Dropdown>
    </ul>
</template>