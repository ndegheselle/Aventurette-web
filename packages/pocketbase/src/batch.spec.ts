import { BatchError, ValidationError, type BaseEntity, type EntityMapper } from '@chapelure/core';
import { describe, expect, it } from 'vitest';
import { createPocketBaseBatch, pocketBaseId } from './batch';
import { fakePocketBase } from './testing';

type StepPayload = BaseEntity & { title: string; resources?: string[] };
type Step = BaseEntity & { name: string; resources?: BaseEntity[] };

const stepMapper: EntityMapper<StepPayload, Step> = {
    relations: [],
    toEntity: ({ id, title }) => ({ id, name: title }),
    toPayload: ({ id, name, resources }) => ({
        ...(id !== undefined && { id }),
        ...(name !== undefined && { title: name }),
        ...(resources && { resources: resources.map(resource => resource.id) }),
    }),
};

/** How the server reports the batch's third write refusing a blank title. */
const aRejectedBatch = {
    status: 400,
    message: 'Batch transaction failed.',
    response: {
        data: {
            requests: {
                2: {
                    code: 'batch_request_failed',
                    message: 'Batch request failed.',
                    response: { status: 400, data: { title: { code: 'validation_required' } } },
                },
            },
        },
    },
};

describe('createPocketBaseBatch', () => {
    it('queues every write through the mapper, and sends them once, in order', async () => {
        const pb = fakePocketBase();
        const batch = createPocketBaseBatch(pb.client);
        const steps = batch.collection('steps', stepMapper);

        steps.create({ id: 'stp1', name: 'Hide' });
        steps.update('stp1', { resources: [{ id: 'res1' }] });
        steps.remove('stp0');
        await batch.send();

        expect(pb.calls).toEqual([
            { method: 'batch.create', args: ['steps', { id: 'stp1', title: 'Hide' }] },
            { method: 'batch.update', args: ['steps', 'stp1', { resources: ['res1'] }] },
            { method: 'batch.delete', args: ['steps', 'stp0'] },
            { method: 'batch.send', args: [] },
        ]);
    });

    it('says which write failed, with that write\'s own field errors', async () => {
        const pb = fakePocketBase();
        const batch = createPocketBaseBatch(pb.client);
        pb.failNextWith(aRejectedBatch);

        const error = await batch.send().catch(error => error);

        expect(error).toBeInstanceOf(BatchError);
        expect(error.index).toBe(2);
        expect(error.fields).toEqual({ title: { code: 'validation_required' } });
    });

    it('is a plain ValidationError when the rejection names no write', async () => {
        // Batching switched off on the server answers 403 and no `requests`.
        const pb = fakePocketBase();
        const batch = createPocketBaseBatch(pb.client);
        pb.failNextWith({ status: 403, message: 'Batch requests are not allowed.', response: { data: {} } });

        const error = await batch.send().catch(error => error);

        expect(error).toBeInstanceOf(ValidationError);
        expect(error).not.toBeInstanceOf(BatchError);
    });
});

describe('pocketBaseId', () => {
    it('is in the format PocketBase accepts for an id it did not choose', () => {
        expect(pocketBaseId()).toMatch(/^[a-z0-9]{15}$/);
    });
});
