/**
 * Whether `item` is among `selected`. With `keyBy`, a picked item matches an option by that key
 * rather than by reference, so a copy of the row from another read still counts.
 */
export function isPicked<T>(selected: T[], item: T, keyBy?: keyof T): boolean {
    if (!keyBy)
        return selected.includes(item);
    return selected.some(picked => picked[keyBy] === item[keyBy]);
}

/** What `item` reads as in a picker: its `displayKey` field, or the item itself. */
export function displayOf<T>(item: T, displayKey?: keyof T): string {
    const shown = displayKey ? item[displayKey] : item;
    return String(shown);
}

/** `selected` with `item` removed if it was picked, added otherwise. */
export function toggled<T>(selected: T[], item: T, keyBy?: keyof T): T[] {
    if (!isPicked(selected, item, keyBy))
        return [...selected, item];
    return selected.filter(picked => !isPicked([item], picked, keyBy));
}

/** What a picker offers for a plain value: the value, and what it reads as. */
export interface Option<V> {
    value: V;
    label: string;
}

export function optionsOf<V>(values: readonly V[], label: (value: V) => string): Option<V>[] {
    return values.map(value => ({ value, label: label(value) }));
}

/** The options standing for `values`, in the options' order. A value no option offers is dropped. */
export function optionsFor<V>(options: Option<V>[], values: readonly V[]): Option<V>[] {
    return options.filter(option => values.includes(option.value));
}

export function valuesOf<V>(options: Option<V>[]): V[] {
    return options.map(option => option.value);
}
