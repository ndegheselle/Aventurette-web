<!-- Password field with a reveal toggle. -->
<script setup lang="ts">
import { EyeClosedIcon, EyeIcon, KeyRoundIcon } from 'lucide-vue-next';
import { ref } from 'vue';

defineProps<{
    error?: boolean;
}>();

const model = defineModel<string>();
const isRevealed = ref(false);
</script>

<template>
    <label class="input"
           :class="{ 'input-error': error }">
        <KeyRoundIcon class="opacity-50" />
        <input class="grow"
               :type="isRevealed ? 'text' : 'password'"
               v-model="model" />
        <button class="btn btn-ghost btn-sm btn-circle absolute right-1"
                :aria-label="$t('users.form.password')"
                @click="isRevealed = !isRevealed">
            <EyeIcon v-if="isRevealed" />
            <EyeClosedIcon v-else />
        </button>
    </label>
</template>
