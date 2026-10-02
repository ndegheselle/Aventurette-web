import {
    BatchError,
    type BaseEntity,
    type EntityMapper,
    type FieldErrors,
    type IBatchCollection,
    type IDataBatch,
} from '@chapelure/core';
import type PocketBase from 'pocketbase';
import type { ClientResponseError } from 'pocketbase';
import { toValidationError } from './errors';

/**
 * IDataBatch over PocketBase's `/api/batch`, which runs every queued write in one transaction.
 */
export function createPocketBaseBatch(client: PocketBase): IDataBatch {
    const batch = client.createBatch();

    function collection<TPayload extends BaseEntity, TEntity extends BaseEntity>(
        name: string,
        mapper: EntityMapper<TPayload, TEntity>
    ): IBatchCollection<TEntity> {
        const writes = batch.collection(name);

        return {
            create: data => writes.create(mapper.toPayload(data)),
            update: (id, data) => writes.update(id, mapper.toPayload(data)),
            remove: id => writes.delete(id),
        };
    }

    async function send(): Promise<void> {
        try {
            await batch.send();
        } catch (error) {
            throw toBatchError(error) ?? toValidationError(error) ?? error;
        }
    }

    return { collection, send };
}

/** How the server reports which write failed: under `requests`, keyed by its index. */
type FailedRequests = Record<string, { response?: { data?: FieldErrors } }>;

/**
 * A rejected batch, with the failed write's place in it and its own field errors. Undefined when
 * the rejection names no write — batching switched off, say, or a request that never reached it.
 */
export function toBatchError(error: unknown): BatchError | undefined {
    if (!error || typeof error !== 'object') return undefined;

    const response = error as Partial<ClientResponseError>;
    const requests = response.response?.data?.requests as FailedRequests | undefined;
    if (!requests || typeof requests !== 'object') return undefined;

    const [failed] = Object.entries(requests);
    if (!failed) return undefined;

    const [index, detail] = failed;
    return new BatchError(Number(index), detail?.response?.data ?? {}, response.message);
}

const ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const ID_LENGTH = 15;

/**
 * A record id in PocketBase's default format, 15 of `[a-z0-9]`. The modulo leans a little towards
 * the first letters of the alphabet; an id needs to be unique, not uniform.
 */
export function pocketBaseId(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH));
    return Array.from(bytes, byte => ID_ALPHABET[byte % ID_ALPHABET.length]).join('');
}
