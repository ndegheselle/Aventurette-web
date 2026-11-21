<!-- Password field with a reveal toggle. -->
<script setup lang="ts">
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@chapelure/ui/shadcn/input-group';
import { EyeClosedIcon, EyeIcon, KeyRoundIcon } from 'lucide-vue-next';
import { ref } from 'vue';

defineProps<{
    error?: boolean;
}>();

const model = defineModel<string>();
const isRevealed = ref(false);
</script>

<template>
    <InputGroup>
        <InputGroupAddon>
            <KeyRoundIcon />
        </InputGroupAddon>
        <InputGroupInput :type="isRevealed ? 'text' : 'password'"
                         :aria-invalid="error || undefined"
                         v-model="model" />
        <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs"
                              class="rounded-full"
                              :aria-label="$t('inputs.password.reveal')"
                              @click="isRevealed = !isRevealed">
                <EyeIcon v-if="isRevealed" />
                <EyeClosedIcon v-else />
            </InputGroupButton>
        </InputGroupAddon>
    </InputGroup>
</template>
