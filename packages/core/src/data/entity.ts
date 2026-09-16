/** The minimum a record must expose to the data layer. Richer types satisfy it structurally. */
export type BaseEntity = {
    id: string;
};

/**
 * A record whose relation fields hold the related records instead of their ids.
 *
 *     type ActivityData = Expanded<ActivitiesResponse, { steps: ActivityStepData[] }>;
 *
 * Declare exactly the fields passed as `relations` to the CrudFactory — nothing checks the two
 * against each other, so anything else makes the type lie. Writing stays id-based: saving the
 * parent persists the relation ids only, never the children.
 */
export type Expanded<TEntity, TRelations> =
    Omit<TEntity, keyof TRelations | 'expand'> & TRelations;
