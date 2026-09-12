import { useAlert } from '@chapelure/ui/composables/useAlert';
import { aPickedFile, aResource, fakeFileUrls } from '@tests';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { StepResourceData } from '@features/activities/model/activity';
import ResourcesSelection from './ResourcesSelection.vue';

const files = fakeFileUrls();

vi.mock('@features/activities/api/resources.api', () => ({
    resourcesApi: { getFileUrl: (resource: any) => files.getUrl(resource, resource.file) },
}));

const alert = useAlert();

function mountSelection(selected: StepResourceData[] = []) {
    return mount(ResourcesSelection, { props: { modelValue: selected } });
}

/** Drive the hidden file input the way a real pick or drop does. */
async function pick(wrapper: ReturnType<typeof mountSelection>, picked: File[]) {
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, 'files', { value: picked, configurable: true });
    await input.trigger('change');
}

beforeEach(() => {
    alert.alerts.value = [];
});

describe('ResourcesSelection', () => {
    it('says so when a step has no resources yet', () => {
        expect(mountSelection().text()).toContain('No resources');
    });

    it('shows a tile per resource the step carries, each named and editable', () => {
        const wrapper = mountSelection([aResource({ name: 'Rules' }), aResource({ name: 'Map' })]);

        const names = wrapper.findAll('input[type="text"]')
            .map(input => (input.element as HTMLInputElement).value);
        expect(names).toEqual(['Rules', 'Map']);
    });

    it('links a saved resource to its stored file', () => {
        const saved = aResource({ file: 'rules.pdf' });
        const wrapper = mountSelection([saved]);

        expect(wrapper.find('a').attributes('href')).toBe(`https://files.test/${saved.id}/rules.pdf`);
    });

    it('adds picked files to the step, named after the file', async () => {
        const wrapper = mountSelection();

        await pick(wrapper, [aPickedFile('map.png')]);

        const updated = wrapper.emitted('update:modelValue')?.at(-1)?.[0] as StepResourceData[];
        expect(updated).toEqual([{ file: expect.any(File), name: 'map.png' }]);
    });

    it('keeps the files on the step rather than in its own state, so they travel with it', async () => {
        // A pending upload has to be part of the model: the step is what gets saved.
        const wrapper = mountSelection();

        await pick(wrapper, [aPickedFile('map.png')]);

        expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    });

    it('turns down files past the limit and says why', async () => {
        const full = Array.from({ length: 10 }, () => aResource());
        const wrapper = mountSelection(full);

        await pick(wrapper, [aPickedFile('one-too-many.png')]);

        // Nothing was taken, so there is no new model to report — only the explanation.
        expect(wrapper.emitted('update:modelValue')).toBeUndefined();
        expect(alert.alerts.value[0]?.message).toBe('10 files maximum.');
    });

    it('stays silent while there is room', async () => {
        const wrapper = mountSelection();

        await pick(wrapper, [aPickedFile('map.png')]);

        expect(alert.alerts.value).toEqual([]);
    });

    it('removes the resource whose bin was clicked', async () => {
        const keep = aResource({ name: 'Keep' });
        const wrapper = mountSelection([aResource({ name: 'Drop' }), keep]);

        await wrapper.findAll('.btn-error')[0]!.trigger('click');

        expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([keep]);
    });

    it('accepts only the documented file types', () => {
        expect(mountSelection().find('input[type="file"]').attributes('accept'))
            .toBe('.png,.jpeg,.jpg,.pdf');
    });
});
