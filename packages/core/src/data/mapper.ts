import type { IFileUrlResolver } from "../files/resolver";
import type { BaseEntity } from "./entity";

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
