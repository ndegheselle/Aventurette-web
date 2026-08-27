<!-- Password field with a reveal toggle. -->
<script setup lang="ts">
import { EyeClosedIcon, EyeIcon, KeyRoundIcon } from 'lucide-vue-next';
import Button from '@chapelure/ui/primitives/Button.vue';
import InputGroup from '@chapelure/ui/primitives/InputGroup.vue';
import { ref } from 'vue';

defineProps<{
    error?: boolean;
}>();

const model = defineModel<string>();
const isRevealed = ref(false);
</script>

<template>
    <InputGroup :error="error">
        <KeyRoundIcon class="opacity-50" />
        <input class="grow"
               :type="isRevealed ? 'text' : 'password'"
               v-model="model" />
        <Button variant="ghost"
                shape="circle"
                size="sm"
                class="absolute right-1"
                :aria-label="$t('users.form.password')"
                @click="isRevealed = !isRevealed">
            <EyeIcon v-if="isRevealed" />
            <EyeClosedIcon v-else />
        </Button>
    </InputGroup>
</template>
