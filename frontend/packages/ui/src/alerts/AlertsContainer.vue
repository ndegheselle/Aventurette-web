<script setup lang="ts">
import { EnumAlertType, useAlert } from '@chapelure/ui/alerts/useAlert';
import { CircleCheckIcon, TriangleAlertIcon, XIcon } from 'lucide-vue-next';
import { useTemplateRef, watchEffect } from 'vue';

const { alerts, close, act } = useAlert();

const dialogRef = useTemplateRef('dialogRef');

watchEffect(() => {
    if (dialogRef.value && !dialogRef.value.open) {
        dialogRef.value.show();
    }
});
</script>

<template>
    <dialog ref="dialogRef" class="z-9999"> 
        <TransitionGroup name="alert" tag="div" class="toast stack stack-top" v-if="alerts.length > 0">
            <div role="alert" class="alert" 
                v-for="alert in alerts.toReversed()" :key="alert.id" 
                :class="{
                    'alert-error alert-soft border border-error': alert.type === EnumAlertType.Error,
                    'alert-success alert-soft border border-success': alert.type === EnumAlertType.Success
                }">
                <TriangleAlertIcon class="opacity-50" v-if="alert.type === EnumAlertType.Error" />
                <CircleCheckIcon class="opacity-50" v-else-if="alert.type === EnumAlertType.Success" />
                <span>{{ alert.message }}</span>
                <button v-if="alert.action" @click="act(alert)" class="btn btn-sm">
                    {{ alert.action.label }}
                </button>
                <button @click="close(alert.id)" class="btn btn-sm btn-ghost btn-circle" :aria-label="$t('actions.close')">
                    <XIcon class="icon-sm" />
                </button>
            </div>
        </TransitionGroup>
    </dialog>
</template>
<style scoped>
.alert-enter-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}
.alert-leave-active {
    transition: opacity 0.5s ease, transform 0.5s ease;
}
.alert-enter-from {
    opacity: 0;
    transform: translateY(-10px); /* slides in from above */
}
.alert-leave-to {
    opacity: 0;
    transform: translateY(-10px); /* slides out upward */
}
</style>