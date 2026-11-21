<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { InputGroupButtonVariants } from "."
import type { ButtonVariants } from "@chapelure/ui/shadcn/button"
import { cn } from "@chapelure/ui/shadcn/utils"
import { Button } from "@chapelure/ui/shadcn/button"
import { inputGroupButtonVariants } from "."

interface InputGroupButtonProps {
  variant?: ButtonVariants["variant"]
  size?: InputGroupButtonVariants["size"]
  class?: HTMLAttributes["class"]
}

const props = withDefaults(defineProps<InputGroupButtonProps>(), {
  size: "xs",
  variant: "ghost",
})
</script>

<template>
  <Button
    :data-size="props.size"
    :variant="props.variant"
    :class="cn(inputGroupButtonVariants({ size: props.size }), props.class)"
  >
    <slot />
  </Button>
</template>
