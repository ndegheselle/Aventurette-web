import { aPickedFile, aResource, fakeFileUrls } from '@tests';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import type { ActivityResourceData } from '@features/activities/model/activity';
import ResourcesSelection from './ResourcesSelection.vue';

const files = fakeFileUrls();
const uploaded = aResource({ name: 'map.png', file: 'map.png' });

vi.mock('@features/activities/api/resources.api', () => ({
    resourcesApi: {
        upload: async () => uploaded,
        getFileUrl: (resource: ActivityResourceData) => files.getUrl(resource, resource.file),
    },
}));

function mountSelection(selected: ActivityResourceData[] = []) {
    return mount(ResourcesSelection, { props: { modelValue: selected, step: 'stp-1' } });
}

/** Drive the hidden file input the way a real pick or drop does. */
async function pick(wrapper: ReturnType<typeof mountSelection>, picked: File[]) {
    const input = wrapper.find('input[type="file"]');
    Object.defineProperty(input.element, 'files', { value: picked, configurable: true });
    await input.trigger('change');
}

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

    it('links a resource to its stored file', () => {
        const saved = aResource({ file: 'rules.pdf' });
        const wrapper = mountSelection([saved]);

        expect(wrapper.find('a').attributes('href')).toBe(`https://files.test/${saved.id}/rules.pdf`);
    });

    it('puts the record a picked file was uploaded as on the step', async () => {
        // The upload happens as the file is picked, so what reaches the model is a record.
        const wrapper = mountSelection();

        await pick(wrapper, [aPickedFile('map.png')]);
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([uploaded]);
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
