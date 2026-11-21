<script setup lang="ts">
import { EnumTheme, useSettings } from '@chapelure/ui/settings/useSettings';
import { Button } from '@chapelure/ui/shadcn/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@chapelure/ui/shadcn/dropdown-menu';
import { PaletteIcon } from 'lucide-vue-next';

const { currentLanguage, changeTheme, changeLang } = useSettings();
</script>

<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="rounded-full" :aria-label="$t('settings.theme')">
                <PaletteIcon />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>{{ $t("settings.theme") }}</DropdownMenuLabel>
            <DropdownMenuItem @select="changeTheme(EnumTheme.auto)">
                <span class="relative size-4 overflow-hidden rounded border">
                    <span class="light absolute inset-0 bg-background"></span>
                    <span class="dark absolute inset-0 bg-background"
                          style="clip-path: polygon(100% 0, 100% 100%, 0 100%)"></span>
                </span>
                {{ $t("settings.themes.auto") }}
            </DropdownMenuItem>
            <DropdownMenuItem @select="changeTheme(EnumTheme.light)">
                <span class="light size-4 rounded border bg-background"></span>
                {{ $t("settings.themes.light") }}
            </DropdownMenuItem>
            <DropdownMenuItem @select="changeTheme(EnumTheme.dark)">
                <span class="dark size-4 rounded border bg-background"></span>
                {{ $t("settings.themes.dark") }}
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="rounded-full uppercase">
                {{ currentLanguage }}
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-40">
            <DropdownMenuLabel>{{ $t("settings.language") }}</DropdownMenuLabel>
            <DropdownMenuItem @select="changeLang('fr')">Français (France)</DropdownMenuItem>
            <DropdownMenuItem @select="changeLang('en')">English (US)</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>
