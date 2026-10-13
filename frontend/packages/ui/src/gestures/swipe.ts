export type SwipeDirection = 'up' | 'down' | 'left' | 'right';

export interface ISwipeThresholds {
    /** Share of the element's size it has to travel before letting go commits. */
    ratio: number;
    /** Moved faster than this (px/ms) it commits, however short the move. */
    flickVelocity: number;
    /** Under this many px a flick is a twitch, not an intent. */
    flickMinOffset: number;
}

export const DEFAULT_SWIPE_THRESHOLDS: ISwipeThresholds = {
    ratio: 0.3,
    flickVelocity: 0.5,
    flickMinOffset: 20
};

/** How far a pointer moved along `direction`: positive going that way, negative against it. */
export function distanceAlong(direction: SwipeDirection, dx: number, dy: number): number {
    switch (direction) {
        case 'down': return dy;
        case 'up': return -dy;
        case 'right': return dx;
        case 'left': return -dx;
    }
}

/** Whether letting go of a swipe should commit it rather than snap the element back. */
export function shouldCommit(
    offset: number,
    size: number,
    velocity: number,
    thresholds: ISwipeThresholds = DEFAULT_SWIPE_THRESHOLDS
): boolean {
    if (offset <= 0) return false;
    return offset > size * thresholds.ratio
        || (velocity > thresholds.flickVelocity && offset > thresholds.flickMinOffset);
}
