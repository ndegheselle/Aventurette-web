import type { BaseEntity } from "../data/entity";

/** Turns a stored file reference into a url for `<img src>` or `<a href>`. */
export interface IFileUrlResolver {
    /**
     * @param record the entity the file hangs off
     * @param filename value of the record's file field
     * @param options.thumb backend-defined thumbnail spec (e.g. "100x100"), ignored if unsupported
     */
    getUrl(record: BaseEntity, filename: string, options?: { thumb?: string }): string;
}
