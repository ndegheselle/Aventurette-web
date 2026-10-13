import { computed, ref } from 'vue';
import {
    DEFAULT_SWIPE_THRESHOLDS,
    distanceAlong,
    shouldCommit,
    type ISwipeThresholds,
    type SwipeDirection
} from '@chapelure/ui/gestures/swipe';

export interface ISwipeOptions {
    /** The way a swipe counts; moving the other way is ignored. */
    direction: SwipeDirection;
    /** Called when a swipe is let go past its threshold. */
    onCommit: () => void;
    /** The element's size along the direction, in px; the threshold is a share of it. */
    size: () => number;
    thresholds?: Partial<ISwipeThresholds>;
}

/**
 * Follows a pointer drag along one direction. Bind `handlers` to the grabbed element
 * (v-on="handlers") and apply `transform` to the element that moves.
 */
export function useSwipe(options: ISwipeOptions) {
    const thresholds = { ...DEFAULT_SWIPE_THRESHOLDS, ...options.thresholds };

    /** How far the element is dragged along the direction, in px. Never negative. */
    const offset = ref(0);
    const isDragging = ref(false);
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const transform = computed(() => {
        const { direction } = options;
        const sign = direction === 'down' || direction === 'right' ? 1 : -1;
        const axis = direction === 'down' || direction === 'up' ? 'Y' : 'X';
        return `translate${axis}(${sign * offset.value}px)`;
    });

    function reset() {
        offset.value = 0;
    }

    function onPointerdown(event: PointerEvent) {
        isDragging.value = true;
        startX = event.clientX;
        startY = event.clientY;
        startTime = event.timeStamp;
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    }

    function onPointermove(event: PointerEvent) {
        if (!isDragging.value) return;
        // Against the direction would pull the element off its resting place the wrong way.
        offset.value = Math.max(0, distanceAlong(options.direction, event.clientX - startX, event.clientY - startY));
    }

    function onPointerup(event: PointerEvent) {
        if (!isDragging.value) return;
        isDragging.value = false;
        const elapsed = Math.max(event.timeStamp - startTime, 1);
        if (shouldCommit(offset.value, options.size(), offset.value / elapsed, thresholds)) options.onCommit();
        else reset();
    }

    return {
        offset,
        isDragging,
        transform,
        reset,
        handlers: {
            pointerdown: onPointerdown,
            pointermove: onPointermove,
            pointerup: onPointerup,
            pointercancel: onPointerup
        }
    };
}
