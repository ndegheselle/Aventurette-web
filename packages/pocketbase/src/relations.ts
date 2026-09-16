/**
 * Relations between PocketBase's wire shape and the app's: expanded records on the way out,
 * ids on the way in. `Expanded` in @chapelure/core is the type side of this.
 */

/**
 * Fold `expand` into the record: each expanded relation replaces its own id list. Recurses, so
 * a nested expand (`steps.materials`) is inlined too.
 *
 * A relation missing from `expand` keeps its ids — either it was not requested, or it is a
 * to-many that matched nothing, which PocketBase omits rather than sending back an empty array.
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
 * Pass top-level relation names only — a write stores step ids and stops there, so a nested
 * path like `steps.materials` has no meaning here. Ids and absent fields pass through untouched.
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
