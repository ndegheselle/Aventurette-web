import { useAlert } from '@chapelure/ui/composables/useAlert';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import FilesInput from './FilesInput.vue';

const alert = useAlert();

/**
 * Put files on the hidden <input type="file"> and fire its change event — the same path a
 * real pick or a drop takes. `files` is read-only, hence defineProperty.
 */
async function pick(wrapper: ReturnType<typeof mount>, files: File[]) {
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    await wrapper.find('input[type="file"]').trigger('change');
}

function aFile(name: string, type: string, sizeBytes = 1024) {
    const file = new File(['x'], name, { type });
    Object.defineProperty(file, 'size', { value: sizeBytes });
    return file;
}

beforeEach(() => {
    alert.alerts.value = [];
});

describe('FilesInput', () => {
    it('emits the files that pass', async () => {
        const wrapper = mount(FilesInput, { props: { accept: 'image/*', multiple: true } });

        await pick(wrapper, [aFile('a.png', 'image/png'), aFile('b.jpg', 'image/jpeg')]);

        expect(wrapper.emitted('change')?.[0]?.[0]).toHaveLength(2);
    });

    it('accepts by extension as well as by mime type', async () => {
        const wrapper = mount(FilesInput, { props: { accept: '.pdf' } });

        await pick(wrapper, [aFile('rules.pdf', 'application/pdf')]);

        expect(wrapper.emitted('change')).toBeDefined();
    });

    it('turns down a file of the wrong type and says which', async () => {
        const wrapper = mount(FilesInput, { props: { accept: 'image/*' } });

        await pick(wrapper, [aFile('notes.txt', 'text/plain')]);

        expect(wrapper.emitted('change')).toBeUndefined();
        expect(alert.alerts.value[0]?.message).toContain('notes.txt');
    });

    it('turns down a file over the size limit', async () => {
        const wrapper = mount(FilesInput, { props: { accept: 'image/*', maxMbSize: 1 } });

        await pick(wrapper, [aFile('huge.png', 'image/png', 2 * 1_048_576)]);

        expect(wrapper.emitted('change')).toBeUndefined();
        expect(alert.alerts.value[0]?.message).toContain('huge.png');
    });

    it('emits the good files and complains only about the bad ones', async () => {
        const wrapper = mount(FilesInput, { props: { accept: 'image/*', multiple: true } });

        await pick(wrapper, [aFile('good.png', 'image/png'), aFile('bad.txt', 'text/plain')]);

        const emitted = wrapper.emitted('change')?.[0]?.[0] as File[];
        expect(emitted.map(f => f.name)).toEqual(['good.png']);
        expect(alert.alerts.value).toHaveLength(1);
    });

    it('emits nothing at all when every file was rejected', async () => {
        const wrapper = mount(FilesInput, { props: { accept: 'image/*' } });

        await pick(wrapper, [aFile('bad.txt', 'text/plain')]);

        expect(wrapper.emitted('change')).toBeUndefined();
    });

    it('passes accept and multiple through to the real input', () => {
        const wrapper = mount(FilesInput, { props: { accept: '.png,.pdf', multiple: true } });

        const input = wrapper.find('input[type="file"]');
        expect(input.attributes('accept')).toBe('.png,.pdf');
        expect(input.attributes('multiple')).toBeDefined();
    });
});
