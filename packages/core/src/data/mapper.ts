import type { IFileUrlResolver } from "../files/resolver";
import type { BaseEntity, Entity } from "./entity";

/** A relation goes back as the ids of its records. */
export function toIds(records: BaseEntity[]): string[] {
    return records.map(record => record.id);
}

export function toEntities<TPayload extends BaseEntity, TEntity extends BaseEntity>(
    payloads: TPayload[] | undefined, 
    mapper: EntityMapper<TPayload, TEntity>,
    files: IFileUrlResolver) : TEntity[]
{
    return (payloads ?? []).map(payload => mapper.toEntity(payload, files))
}

/** Convert a [choice] to the default '' if the [choice] is null. */
export function convert<T extends string>(choice: T | null): T {
    return (choice ?? '') as T;
}

export function omit<T extends object, K extends keyof T>(
    obj: T,
    key: K
): Omit<T, K> {
    const { [key]: _, ...rest } = obj;
    return rest;
}

/**
 * Translates one collection between the backend's payload and the app's entity. Every model
 * declares one, and it is the only place the two shapes meet: relations inlined and files
 * resolved on the way out, relation ids on the way in.
 */
export interface EntityMapper<TPayload extends BaseEntity, TEntity extends BaseEntity> {
    /**
     * Relations `toEntity` reads out of the payload, as the paths the backend expands
     * (`steps.materials` for a nested one). The data layer fetches exactly these, so the list
     * and the mapper cannot drift apart.
     */
    relations: string[];

    /**
     * @param files resolves the payload's stored file names to urls — handed in rather than
     * imported, so a model stays free of the backend.
     */
    toEntity(payload: TPayload, files: IFileUrlResolver): TEntity;

    /** What a write sends. Partial in, partial out: an update carries the changed fields only. */
    toPayload(entity: Partial<TEntity>): Partial<TPayload>;
}

/**
 * The mapper of a record with no relation to read: the entity is the record without its
 * `expand`, and a write sends the fields as they are.
 */
export function plainMapper<TPayload extends BaseEntity & { expand?: unknown }>(): EntityMapper<TPayload, Entity<TPayload>> {
    return {
        relations: [],
        toEntity: payload => omit(payload, 'expand'),
        // Every field of the entity is one of the record's; TypeScript cannot follow an Omit on a generic.
        toPayload: entity => entity as Partial<TPayload>,
    };
}
