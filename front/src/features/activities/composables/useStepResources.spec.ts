import { useAlert } from '@chapelure/ui/composables/useAlert';
import { aPickedFile, aResource, withSetup } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActivityResourceData } from '@features/activities/model/activity';
import { ref } from 'vue';
import { useStepResources } from './useStepResources';

/** The upload port, in memory: what went up, and a way to make the next one fail. */
function fakeResources() {
    const fake = {
        uploaded: [] as Array<{ file: File; step: string }>,
        failNext: false,
        async upload(file: File, step: string): Promise<ActivityResourceData> {
            if (fake.failNext) {
                fake.failNext = false;
                throw new Error('upload rejected');
            }

            fake.uploaded.push({ file, step });
            return aResource({ name: file.name, file: file.name, step });
        },
        getFileUrl: (resource: ActivityResourceData) => `https://files.test/${resource.id}/${resource.file}`,
    };

    return fake;
}

const resources = fakeResources();

vi.mock('@features/activities/api/resources.api', () => ({
    get resourcesApi() { return resources; },
}));

const alert = useAlert();

function setup(selected: ActivityResourceData[] = []) {
    const model = ref(selected);
    const [subject] = withSetup(() => useStepResources(model, () => 'stp-1'));
    return { subject, model };
}

beforeEach(() => {
    resources.uploaded = [];
    resources.failNext = false;
    alert.alerts.value = [];
});

describe('useStepResources', () => {
    it('uploads a picked file there and then, and puts the record on the step', async () => {
        const { subject, model } = setup();

        await subject.add([aPickedFile('map.png')]);

        expect(resources.uploaded.map(upload => upload.file.name)).toEqual(['map.png']);
        expect(model.value.map(resource => resource.name)).toEqual(['map.png']);
    });

    it('uploads against the step the files belong to, which the collection requires', async () => {
        const { subject } = setup();

        await subject.add([aPickedFile('map.png')]);

        expect(resources.uploaded[0]?.step).toBe('stp-1');
    });

    it('keeps what the step already carried', async () => {
        const sheet = aResource({ name: 'Rules' });
        const { subject, model } = setup([sheet]);

        await subject.add([aPickedFile('map.png')]);

        expect(model.value.map(resource => resource.name)).toEqual(['Rules', 'map.png']);
    });

    it('uploads only the files that fit, and says how many did not', async () => {
        const full = Array.from({ length: 10 }, () => aResource());
        const { subject, model } = setup(full);

        await subject.add([aPickedFile('one-too-many.png')]);

        expect(resources.uploaded).toEqual([]);
        expect(model.value).toHaveLength(10);
        expect(alert.alerts.value[0]?.message).toBe('10 files maximum.');
    });

    it('stays silent while there is room', async () => {
        const { subject } = setup();

        await subject.add([aPickedFile('map.png')]);

        expect(alert.alerts.value).toEqual([]);
    });

    it('reports a failed upload and leaves the step as it was', async () => {
        const { subject, model } = setup();
        resources.failNext = true;

        await subject.add([aPickedFile('map.png')]);
        await flushPromises();

        expect(model.value).toEqual([]);
        expect(alert.alerts.value[0]?.message).toBe('The file could not be uploaded.');
    });

    it('drops the resource at the index it was removed from', () => {
        const keep = aResource({ name: 'Keep' });
        const { subject, model } = setup([aResource({ name: 'Drop' }), keep]);

        subject.remove(0);

        expect(model.value).toEqual([keep]);
    });
});
