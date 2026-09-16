import type { BaseEntity, IFileUrlResolver } from '@chapelure/core';
import type PocketBase from 'pocketbase';
import type { RecordModel } from 'pocketbase';

/** Resolves stored file references to urls. */
export function createPocketBaseFileUrls(client: PocketBase): IFileUrlResolver {
    return {
        getUrl(record: BaseEntity, filename: string, options?: { thumb?: string }): string {
            // getURL needs collection metadata that generated records carry but BaseEntity
            // does not describe.
            return client.files.getURL(
                record as unknown as RecordModel,
                filename,
                options?.thumb ? { thumb: options.thumb } : undefined
            );
        },
    };
}
