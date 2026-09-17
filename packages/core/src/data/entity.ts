/** The minimum a record must expose to the data layer. Richer types satisfy it structurally. */
export type BaseEntity = {
    id: string;
};

/**
 * The domain side of a backend payload: relation fields holding the related entities instead of
 * their ids, and nothing of the wire shape left.
 *
 *     type ActivityData = Entity<ActivitiesResponse, { steps: ActivityStepData[] }>;
 *
 * What fills those fields is the model's own mapper — see `EntityMapper`. Writing stays
 * id-based: saving the parent persists the relation ids only, never the children.
 */
export type Entity<TPayload, TRelations extends object = object> =
    Omit<TPayload, keyof TRelations | 'expand'> & TRelations;
