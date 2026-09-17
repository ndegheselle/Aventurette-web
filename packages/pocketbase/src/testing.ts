/**
 * A stand-in for the PocketBase SDK client, for this package's own specs. Written against the
 * SDK's real method names, so a spec can assert the options the adapter passes.
 */
import type { BaseEntity, EntityMapper } from '@chapelure/core';
import type PocketBase from 'pocketbase';

/** A mapper that translates nothing — for specs about the adapter rather than about a model. */
export function passthroughMapper<T extends BaseEntity>(relations: string[] = []): EntityMapper<T, T> {
    return {
        relations,
        toEntity: (payload) => payload,
        toPayload: (entity) => entity,
    };
}

export interface RecordedCall {
    method: string;
    args: unknown[];
}

export interface FakePocketBase {
    client: PocketBase;
    /** Every call the adapter made, in order. */
    calls: RecordedCall[];
    /** Records the fake collection answers reads with. */
    records: Record<string, unknown>[];
    /** The next call to any method rejects with this. */
    failNextWith(error: unknown): void;
    /** Arguments of the last call to `method`. */
    lastCall(method: string): unknown[] | undefined;
}

export function fakePocketBase(records: Record<string, unknown>[] = []): FakePocketBase {
    let pendingFailure: unknown = undefined;

    const fake: FakePocketBase = {
        calls: [],
        records: [...records],
        failNextWith(error) { pendingFailure = error; },
        lastCall(method) {
            return [...fake.calls].reverse().find(c => c.method === method)?.args;
        },
        client: null as unknown as PocketBase,
    };

    function record(method: string, args: unknown[]) {
        fake.calls.push({ method, args });
        if (pendingFailure === undefined) return;
        const failure = pendingFailure;
        pendingFailure = undefined;
        throw failure;
    }

    const collection = {
        async authWithPassword(email: string, password: string) {
            record('authWithPassword', [email, password]);
            return { record: fake.records[0] ?? { id: 'usr1', email }, token: 'fake-token' };
        },
        async authRefresh() {
            record('authRefresh', []);
            return { record: fake.records[0], token: 'fake-token' };
        },
        async requestVerification(email: string) {
            record('requestVerification', [email]);
            return true;
        },
        async create(data: Record<string, unknown>, options?: unknown) {
            record('create', [data, options]);
            const created = { id: `pb${fake.records.length + 1}`, ...data };
            fake.records.push(created);
            return created;
        },
        async update(id: string, data: Record<string, unknown>, options?: unknown) {
            record('update', [id, data, options]);
            const index = fake.records.findIndex(r => r.id === id);
            const updated = { ...fake.records[index], ...data };
            fake.records[index] = updated;
            return updated;
        },
        async delete(id: string) {
            record('delete', [id]);
            fake.records = fake.records.filter(r => r.id !== id);
            return true;
        },
        async getOne(id: string, options?: unknown) {
            record('getOne', [id, options]);
            return fake.records.find(r => r.id === id);
        },
        async getFullList(options?: unknown) {
            record('getFullList', [options]);
            return [...fake.records];
        },
        async getList(page: number, perPage: number, options?: unknown) {
            record('getList', [page, perPage, options]);
            const start = (page - 1) * perPage;
            return {
                items: fake.records.slice(start, start + perPage),
                totalItems: fake.records.length,
            };
        },
    };

    const authStore = {
        clear() { record('authStore.clear', []); },
    };

    const files = {
        getURL(model: unknown, filename: string, options?: unknown) {
            record('files.getURL', [model, filename, options]);
            return `https://pb.test/api/files/${(model as { id: string }).id}/${filename}`;
        },
    };

    fake.client = { collection: () => collection, authStore, files } as unknown as PocketBase;
    return fake;
}
