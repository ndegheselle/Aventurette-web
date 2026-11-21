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

/** An end back at its edge bounds nothing, so it reads as unset, as it started. */
export function lowValue(bounds: RangeBounds, value: number): number | null {
    return value <= bounds.floor ? null : value;
}

export function highValue(bounds: RangeBounds, value: number): number | null {
    return value >= bounds.ceiling ? null : value;
}

/** What a range reads as beside its label. `key` is a translation key, `params` its values. */
export interface RangeLabel {
    key: string;
    params: { min?: number; max?: number };
}

export function rangeLabel(min: number | null, max: number | null): RangeLabel {
    if (min === null && max === null) return { key: 'inputs.range.any', params: {} };
    if (max === null) return { key: 'inputs.range.from', params: { min: min! } };
    if (min === null) return { key: 'inputs.range.upTo', params: { max } };
    if (min === max) return { key: 'inputs.range.exactly', params: { min } };

    return { key: 'inputs.range.between', params: { min, max } };
}
