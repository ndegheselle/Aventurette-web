/**
 * Moving relations between PocketBase's wire shape and the app's.
 *
 * PocketBase answers a read with the related records in a separate `expand` object keyed by
 * relation name, and leaves the record's own field holding ids. The app would rather have one
 * shape — `activity.steps` is the steps — so the adapter inlines them on the way out and puts
 * the ids back on the way in. `Expanded` in @chapelure/core is the type side of this.
 */

/**
 * Fold `expand` into the record: each expanded relation replaces its own id list.
 *
 * Recursive, because a nested expand (`steps.materials`) arrives as an `expand` on each
 * expanded record. Anything PocketBase leaves out of `expand` keeps its ids — a relation that
 * was never requested, and equally a to-many relation that matched nothing, which PocketBase
 * omits rather than sending back an empty array.
 */
export function inlineRelations<TResponse>(record: unknown): TResponse {
    if (record === null || typeof record !== 'object') return record as TResponse;

    const { expand, ...inlined } = record as Record<string, unknown>;

    for (const [relation, related] of Object.entries((expand ?? {}) as Record<string, unknown>))
        inlined[relation] = Array.isArray(related)
            ? related.map((item) => inlineRelations(item))
            : inlineRelations(related);

    return inlined as TResponse;
}

/**
 * The inverse, for writes: a relation field holding records goes back to holding their ids.
 *
 * `fields` are top-level relation names only. A nested path like `steps.materials` says how to
 * read an activity, never how to write one — the parent write stores step ids and stops there.
 * Values that are already ids pass through untouched, so a caller that never expanded, or an
 * update that omits the relation entirely, is unaffected.
 */
export function relationsToIds(data: object, fields: string[]): Record<string, unknown> {
    const written = { ...data } as Record<string, unknown>;

    for (const field of fields) {
        const value = written[field];
        if (Array.isArray(value)) written[field] = value.map(toId);
        else if (value !== null && typeof value === 'object') written[field] = toId(value);
    }

    return written;
}

function toId(value: unknown): unknown {
    return value !== null && typeof value === 'object' && 'id' in value ? value.id : value;
}

/** Top-level relation names of a list of expand paths: `steps.materials` counts as `steps`. */
export function relationFields(relations: string[] | undefined): string[] {
    return [...new Set(relations?.map((relation) => relation.split('.', 1)[0] ?? relation) ?? [])];
}
