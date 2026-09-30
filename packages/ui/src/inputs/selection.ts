/**
 * Whether `item` is among `selected`. With `keyBy`, a picked item matches an option by that key
 * rather than by reference, so a copy of the row from another read still counts.
 */
export function isPicked<T>(selected: T[], item: T, keyBy?: keyof T): boolean {
    if (!keyBy)
        return selected.includes(item);
    return selected.some(picked => picked[keyBy] === item[keyBy]);
}

/** `selected` with `item` removed if it was picked, added otherwise. */
export function toggled<T>(selected: T[], item: T, keyBy?: keyof T): T[] {
    if (!isPicked(selected, item, keyBy))
        return [...selected, item];
    return selected.filter(picked => !isPicked([item], picked, keyBy));
}
