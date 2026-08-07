import type { BaseEntity } from "../data/entity";

/**
 * Turns a stored file reference into something an <img src> or <a href> can use.
 *
 * This exists so components never need the backend client just to display an upload —
 * that was the one leak that made the data seam porous.
 */
export interface IFileUrlResolver {
    /**
     * @param record the entity the file hangs off
     * @param filename value of the record's file field
     * @param options.thumb backend-defined thumbnail spec (e.g. "100x100"), ignored if unsupported
     */
    getUrl(record: BaseEntity, filename: string, options?: { thumb?: string }): string;
}
