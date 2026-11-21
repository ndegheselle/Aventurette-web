<!-- Driven by a useModal controller: <Modal :controller /> -->
<script setup lang="ts" generic="T = boolean">
import { keepOpenOnAlerts } from '@chapelure/ui/alerts/useAlert';
import { useModal, type IModalController } from '@chapelure/ui/modals/useModal';
import { Button } from '@chapelure/ui/shadcn/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@chapelure/ui/shadcn/dialog';
import { CheckIcon, XIcon } from 'lucide-vue-next';

const { controller = useModal(), withActions = true } = defineProps<{
    withActions?: boolean,
    controller?: IModalController<T>
}>();

// Closed by the overlay or Escape: that is a cancel, so clicking away never confirms by accident.
function onOpenChange(open: boolean) {
    if (!open) controller.cancel();
}

defineSlots<{
    title: any;
    default: any;
    actions: any;
}>();
</script>

<template>
    <Dialog :open="controller.isShown.value"
            @update:open="onOpenChange">
        <DialogContent class="flex max-h-[90dvh] flex-col sm:max-w-5xl"
                       :show-close-button="false"
                       :aria-describedby="undefined"
                       @interact-outside="keepOpenOnAlerts">
            <DialogHeader class="flex-row items-center">
                <DialogTitle class="text-lg">
                    <slot name="title" />
                </DialogTitle>
                <Button variant="ghost"
                        size="icon-sm"
                        class="ms-auto rounded-full"
                        data-slot="dialog-close"
                        :aria-label="$t('actions.close')"
                        @click="() => controller.cancel()">
                    <XIcon />
                </Button>
            </DialogHeader>

            <div class="-mx-6 overflow-y-auto px-6"
                 data-slot="dialog-body">
                <slot />
            </div>

            <DialogFooter v-if="withActions">
                <slot name="actions">
                    <Button variant="outline"
                            @click="() => controller.cancel()">
                        <XIcon />
                        {{ $t("actions.cancel") }}
                    </Button>
                    <!-- The default actions are a yes or no: a modal answering anything else brings its own. -->
                    <Button @click="() => controller.confirm(true as T)">
                        <CheckIcon />
                        {{ $t("actions.confirm") }}
                    </Button>
                </slot>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
