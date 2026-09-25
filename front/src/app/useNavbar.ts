import {ref, onScopeDispose } from 'vue';

const title = ref<string | null>();

export function useNavbar(_title: string | null | undefined = undefined) {
    if (_title != undefined)
        title.value = _title;
    onScopeDispose(() => title.value = undefined);
    return { title };
}