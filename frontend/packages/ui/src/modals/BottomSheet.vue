<!-- Driven by a useModal controller: <BottomSheet :controller height="half" />. Closes on the cross or by pulling the header down. -->
<script setup lang="ts" generic="T = boolean">
import { useModal, type IModalController } from '@chapelure/ui/modals/useModal';
import { useSwipe } from '@chapelure/ui/gestures/useSwipe';
import { XIcon } from 'lucide-vue-next';
import { useTemplateRef, watch } from 'vue';

/** `auto` fits the content, `half` takes half the screen, `full` almost all of it. */
export type BottomSheetHeight = 'auto' | 'half' | 'full';

const { controller = useModal(), height = 'auto' } = defineProps<{
    controller?: IModalController<T>;
    height?: BottomSheetHeight;
}>();

const heights: Record<BottomSheetHeight, string> = {
    auto: 'max-h-[90dvh]',
    half: 'h-[50dvh] max-h-[50dvh]',
    full: 'h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)]'
};

const dialog = useTemplateRef<HTMLDialogElement>('dialog');
const box = useTemplateRef<HTMLElement>('box');

// Pulling the sheet down closes it.
const { isDragging, transform, reset, handlers } = useSwipe({
    direction: 'down',
    size: () => box.value?.offsetHeight ?? 0,
    onCommit: () => controller.cancel()
});

watch(controller.isShown, (isShown) => {
    reset();
    if (isShown) {
        dialog.value?.show();
    } else {
        dialog.value?.close();
    }
});

defineSlots<{
    title: any;
    default: any;
}>();
</script>

<template>
    <dialog ref="dialog"
            class="modal modal-bottom">
        <div ref="box"
             class="modal-box flex flex-col p-0 w-full max-w-none"
             :class="[heights[height], { 'transition-transform': !isDragging }]"
             :style="{ transform }">
            <!-- The pull zone: the handle and the title. touch-none keeps the browser from scrolling instead. -->
            <div class="touch-none select-none cursor-grab"
                 v-on="handlers">
                <div class="mx-auto mt-2 h-1.5 w-10 rounded-full bg-base-300" />
                <div class="flex items-center px-4 pb-2 pt-1">
                    <h3 class="text-lg font-bold">
                        <slot name="title" />
                    </h3>
                    <button class="btn btn-sm btn-circle btn-ghost ms-auto"
                            :aria-label="$t('actions.close')"
                            @pointerdown.stop
                            @click="() => controller.cancel()">
                        <XIcon />
                    </button>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto px-4 pb-4">
                <slot />
            </div>
        </div>

        <div class="modal-backdrop">
            <button @click="() => controller.cancel()">{{ $t('actions.close') }}</button>
        </div>
    </dialog>
</template>
