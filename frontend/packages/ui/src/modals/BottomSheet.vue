<!-- Driven by a useModal controller: <BottomSheet :controller height="half" />. Closes on the cross or by pulling the header down.
     The `action` slot puts a button at the top right, beside the cross; the default slot is told whether the sheet is expanded. -->
<script setup lang="ts" generic="T = boolean">
import { keepOpenOnAlerts } from '@chapelure/ui/alerts/useAlert';
import { useSwipe } from '@chapelure/ui/gestures/useSwipe';
import { stageAfterPull, type SheetStage } from '@chapelure/ui/modals/sheetStage';
import { useModal, type IModalController } from '@chapelure/ui/modals/useModal';
import { Button } from '@chapelure/ui/shadcn/button';
import { DialogOverlay } from '@chapelure/ui/shadcn/dialog';
import { XIcon } from 'lucide-vue-next';
import { DialogContent, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui';
import { computed, ref, useTemplateRef, watch } from 'vue';

/**
 * `auto` fits the content, `half` takes half the screen, `full` almost all of it.
 * `expandable` opens fitting its content, up to half the screen; pulled up it takes all of it, pulled down it goes back.
 */
export type BottomSheetHeight = 'auto' | 'half' | 'full' | 'expandable';

const { controller = useModal(), height = 'auto' } = defineProps<{
    controller?: IModalController<T>;
    height?: BottomSheetHeight;
}>();

const heights: Record<BottomSheetHeight, string> = {
    auto: 'max-h-[90dvh]',
    half: 'h-[50dvh] max-h-[50dvh]',
    full: 'h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)]',
    // The height follows the stage, through the style below.
    expandable: 'max-h-[calc(100dvh-1rem)]'
};

// Partial fits its content, up to half the screen. The class above caps full and a pull up.
const stageStyles: Record<SheetStage, { height: string; maxHeight?: string }> = {
    partial: { height: 'auto', maxHeight: '50dvh' },
    full: { height: 'calc(100dvh - 1rem)' }
};

const box = useTemplateRef<HTMLElement>('box');

const stage = ref<SheetStage>('partial');
const isExpandable = computed(() => height === 'expandable');

function pull(way: 'up' | 'down') {
    const next = isExpandable.value ? stageAfterPull(stage.value, way) : way === 'down' ? 'closed' : null;
    if (next === 'closed') {
        controller.cancel();
        return;
    }
    if (next) stage.value = next;
    reset();
}

// Pulling the sheet down closes it, or brings an expanded one back; pulling an expandable one up expands it.
const { offset, isDragging, transform, reset, handlers } = useSwipe({
    direction: 'down',
    size: () => box.value?.offsetHeight ?? 0,
    onCommit: () => pull('down'),
    onCommitReverse: () => pull('up'),
    reversible: () => isExpandable.value && stageAfterPull(stage.value, 'up') !== null
});

// An auto height cannot be added to: the sheet's height when a drag starts is what a pull up grows from.
let heightAtGrab = 0;
watch(isDragging, (dragging) => {
    if (dragging) heightAtGrab = box.value?.offsetHeight ?? 0;
});

const boxStyle = computed(() => {
    const resting = isExpandable.value ? stageStyles[stage.value] : {};
    if (offset.value >= 0) return { transform: transform.value, ...resting };
    // Pulled up, the sheet grows with the finger rather than leaving the bottom of the screen.
    return { height: `${heightAtGrab - offset.value}px` };
});

watch(controller.isShown, () => {
    reset();
    stage.value = 'partial';
});

// Closed by the overlay or Escape: that is a cancel.
function onOpenChange(open: boolean) {
    if (!open) controller.cancel();
}

defineSlots<{
    title: any;
    action: any;
    default: (props: { expanded: boolean }) => any;
}>();
</script>

<template>
    <!-- reka's dialog primitives, drawn as shadcn's bottom sheet: its own Sheet has no room for the pull zone. -->
    <DialogRoot :open="controller.isShown.value"
                @update:open="onOpenChange">
        <DialogPortal>
            <DialogOverlay />
            <DialogContent data-slot="sheet-content"
                           class="fixed inset-x-0 bottom-0 z-50 flex w-full flex-col rounded-t-xl border-t bg-background shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom data-[state=closed]:duration-300 data-[state=open]:duration-500"
                           :class="[heights[height], { 'transition-[height,max-height,transform] [interpolate-size:allow-keywords]': !isDragging }]"
                           :style="boxStyle"
                           :aria-describedby="undefined"
                           @interact-outside="keepOpenOnAlerts">
                <div ref="box"
                     class="flex min-h-0 flex-1 flex-col">
                    <!-- The pull zone: the handle and the title. touch-none keeps the browser from scrolling instead. -->
                    <div class="touch-none select-none cursor-grab"
                         v-on="handlers">
                        <div class="mx-auto mt-2 h-1.5 w-10 rounded-full bg-muted" />
                        <div class="flex items-center px-4 pb-2 pt-1">
                            <DialogTitle class="text-lg font-semibold">
                                <slot name="title" />
                            </DialogTitle>
                            <div class="ms-auto flex items-center gap-1"
                                 @pointerdown.stop>
                                <slot name="action" />
                            </div>
                            <Button variant="ghost"
                                    size="icon-sm"
                                    class="rounded-full"
                                    :aria-label="$t('actions.close')"
                                    @pointerdown.stop
                                    @click="() => controller.cancel()">
                                <XIcon />
                            </Button>
                        </div>
                    </div>

                    <div class="flex-1 overflow-y-auto px-4 pb-4">
                        <slot :expanded="isExpandable && stage === 'full'" />
                    </div>
                </div>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>
