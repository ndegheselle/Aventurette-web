/** The bounds a two-thumb range moves within. */
export interface RangeBounds {
    floor: number;
    ceiling: number;
}

/** An unset end sits at its edge, so an empty range spans the whole track. */
export function lowOf(bounds: RangeBounds, min: number | null | undefined): number {
    return min ?? bounds.floor;
}

export function highOf(bounds: RangeBounds, max: number | null | undefined): number {
    return max ?? bounds.ceiling;
}

/** The thumbs may meet but not cross: each stops at the other. */
export function clampLow(value: number, high: number): number {
    return Math.min(value, high);
}

export function clampHigh(value: number, low: number): number {
    return Math.max(value, low);
}

/** Position on the track, 0 to 100. */
export function percentOf(bounds: RangeBounds, value: number): number {
    const span = bounds.ceiling - bounds.floor;
    if (span <= 0) return 0;

    return Math.min(100, Math.max(0, (value - bounds.floor) / span * 100));
}

/**
 * Which thumb is on top when they overlap. At the ceiling the max thumb cannot move right, so
 * the min one has to be the one caught; at the floor, the other way round.
 */
export function isLowOnTop(bounds: RangeBounds, low: number): boolean {
    return percentOf(bounds, low) > 50;
}
