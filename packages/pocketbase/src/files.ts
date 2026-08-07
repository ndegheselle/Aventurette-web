import type { BaseEntity, IFileUrlResolver } from '@chapelure/core';
import type PocketBase from 'pocketbase';
import type { RecordModel } from 'pocketbase';

/**
 * Resolves stored file references to URLs, so components can render an upload
 * without ever holding the PocketBase client.
 */
export function createPocketBaseFileUrls(client: PocketBase): IFileUrlResolver {
    return {
        getUrl(record: BaseEntity, filename: string, options?: { thumb?: string }): string {
            // getURL needs the collection metadata that generated records carry but
            // the narrow BaseEntity port does not describe.
            return client.files.getURL(
                record as unknown as RecordModel,
                filename,
                options?.thumb ? { thumb: options.thumb } : undefined
            );
        },
    };
}
