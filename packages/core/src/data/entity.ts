/**
 * The minimum a record must expose for the generic data layer to work with it.
 *
 * Deliberately just an id: anything more (timestamps, collection metadata, soft-delete flags)
 * is backend-specific and belongs in the adapter or in the consuming app's generated types.
 * Richer app types satisfy this structurally, so no wrapping is needed.
 */
export type BaseEntity = {
    id: string;
};

/**
 * A record whose relation fields hold the related records themselves, not their ids.
 *
 * Backends hand relations back on the side — PocketBase in an `expand` object, GraphQL in a
 * selection set, SQL in extra columns. The adapter folds them into the record before anything
 * downstream sees it, so a relation reads the way the schema declares it: `activity.steps`
 * is the steps.
 *
 *     type ActivityData = Expanded<ActivitiesResponse, { steps: ActivityStepData[] }>;
 *
 * `TRelations` names the fields the adapter was asked to load and what they now hold; every
 * other field keeps the type the schema gave it. Two things this does not say, and both bite:
 *
 * - Which fields are expanded depends on the `relations` argument passed to the CrudFactory,
 *   and nothing checks the two against each other. Declare here exactly what that call asks
 *   for, or the type lies.
 * - Writing stays id-based. `activity.steps` may carry whole steps, but saving the activity
 *   persists their ids and nothing else — editing a step is a write to its own collection.
 *
 * `expand` is dropped by name because that is what PocketBase's generated types call the
 * side-channel. It is the one backend word in this package, and it buys every model not
 * having to omit it by hand.
 */
export type Expanded<TEntity, TRelations> =
    Omit<TEntity, keyof TRelations | 'expand'> & TRelations;
