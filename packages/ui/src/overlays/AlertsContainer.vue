<script setup lang="ts">
import { EnumAlertType, useAlert } from '@chapelure/ui/composables/useAlert';
import { BrushCleaningIcon, CircleAlertIcon, CircleCheckIcon, TriangleAlertIcon, XIcon } from 'lucide-vue-next';
import { useTemplateRef, watchEffect } from 'vue';

const { alerts, close } = useAlert();

const dialogRef = useTemplateRef('dialogRef');

watchEffect(() => {
    if (dialogRef.value && !dialogRef.value.open) {
        dialogRef.value.show();
    }
});
</script>

<template>
    <dialog ref="dialogRef" class="z-9999"> 
        <TransitionGroup name="alert" tag="div" class="toast stack stack-top">
            <div role="alert" class="alert" 
                v-for="alert in alerts.toReversed()" :key="alert.id" 
                :class="{
                    'alert-warning alert-dash': alert.type === EnumAlertType.Debug,
                    'alert-warning alert-soft border border-error': alert.type === EnumAlertType.Warning,
                    'alert-error alert-soft border border-error': alert.type === EnumAlertType.Error,
                    'alert-success alert-soft border border-error': alert.type === EnumAlertType.Success
                }">
                <CircleAlertIcon v-if="alert.type === EnumAlertType.Info" />
                <TriangleAlertIcon v-else-if="alert.type === EnumAlertType.Warning || alert.type === EnumAlertType.Error" />
                <CircleCheckIcon v-else-if="alert.type === EnumAlertType.Success" />
                <BrushCleaningIcon v-else-if="alert.type === EnumAlertType.Debug" />
                <span>{{ alert.message }}</span>
                <button @click="close(alert.id)" class="btn btn-sm btn-ghost btn-circle" aria-label="close">
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