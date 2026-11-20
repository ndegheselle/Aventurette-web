<script setup lang="ts">
import { ALERTS_ATTRIBUTE, EnumAlertType, useAlert } from '@chapelure/ui/alerts/useAlert';
import { Alert, AlertDescription } from '@chapelure/ui/shadcn/alert';
import { Button } from '@chapelure/ui/shadcn/button';
import { CircleCheckIcon, TriangleAlertIcon, XIcon } from 'lucide-vue-next';

const { alerts, close, act } = useAlert();
</script>

<template>
    <!-- Above any modal, and clickable while one is open: a modal turns pointer events off on the body.
         Top center on a phone, where the bottom of the screen is the dock's and the page's actions'. -->
    <Teleport to="body">
        <TransitionGroup name="alert"
                         tag="div"
                         v-bind="{ [ALERTS_ATTRIBUTE]: '' }"
                         class="pointer-events-auto fixed inset-x-4 top-4 z-100 flex flex-col gap-2 md:inset-x-auto md:top-auto md:right-4 md:bottom-4 md:w-96">
            <Alert v-for="alert in alerts.toReversed()"
                   :key="alert.id"
                   :variant="alert.type === EnumAlertType.Error ? 'destructive' : 'default'"
                   class="flex items-center gap-3 shadow-lg">
                <TriangleAlertIcon v-if="alert.type === EnumAlertType.Error" />
                <CircleCheckIcon v-else-if="alert.type === EnumAlertType.Success" />
                <AlertDescription class="flex-1 whitespace-pre-line">{{ alert.message }}</AlertDescription>
                <Button v-if="alert.action"
                        variant="outline"
                        size="sm"
                        @click="act(alert)">
                    {{ alert.action.label }}
                </Button>
                <Button variant="ghost"
                        size="icon-sm"
                        class="rounded-full"
                        :aria-label="$t('actions.close')"
                        @click="close(alert.id)">
                    <XIcon class="icon-sm" />
                </Button>
            </Alert>
        </TransitionGroup>
    </Teleport>
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
