import type { BaseEntity } from "./entity";
import type { EntityMapper } from "./mapper";

/** One collection's share of a batch. Each call queues a write; nothing is sent until `send`. */
export interface IBatchCollection<TEntity extends BaseEntity> {
    create(data: TEntity): void;
    update(id: string, data: Partial<TEntity>): void;
    remove(id: string): void;
}

/**
 * Writes over several collections, sent together as one transaction: every one of them lands, or
 * none does. They run in the order they were queued, so a write may point at a record created
 * earlier in the same batch — which is why the ids of new records are chosen by the caller.
 */
export interface IDataBatch {
    /**
     * @param collection name of the collection / table / endpoint
     * @param mapper the model's translation, applied to every write queued through it
     */
    collection<TPayload extends BaseEntity, TEntity extends BaseEntity>(
        collection: string,
        mapper: EntityMapper<TPayload, TEntity>
    ): IBatchCollection<TEntity>;

    /** Rejects with a `BatchError` naming the write that failed, by its place in the queue. */
    send(): Promise<void>;
}

/** Starts an empty batch. Wire one at startup, as for `CrudFactory`. */
export type BatchFactory = () => IDataBatch;

/** A new record's id, in the format the backend accepts — for a batch to point at before it exists. */
export type IdFactory = () => string;
