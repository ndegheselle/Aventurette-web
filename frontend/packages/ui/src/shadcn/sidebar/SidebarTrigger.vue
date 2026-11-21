<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { PanelLeftIcon } from "lucide-vue-next"
import { cn } from "@chapelure/ui/shadcn/utils"
import { Button } from "@chapelure/ui/shadcn/button"
import { useSidebar } from "./utils"

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const { toggleSidebar } = useSidebar()
</script>

<template>
  <Button
    data-sidebar="trigger"
    data-slot="sidebar-trigger"
    variant="ghost"
    size="icon"
    :class="cn('h-7 w-7', props.class)"
    @click="toggleSidebar"
  >
    <PanelLeftIcon />
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>
