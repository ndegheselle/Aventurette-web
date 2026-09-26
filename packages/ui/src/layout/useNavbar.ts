import { onScopeDispose, ref } from 'vue';

const title = ref<string>();

/**
 * The title the navbar shows. A page passing one holds it until it unmounts; the layout calls
 * this bare to read it.
 */
export function useNavbar(pageTitle?: string) {
    if (pageTitle !== undefined) {
        title.value = pageTitle;
        onScopeDispose(() => title.value = undefined);
    }

    return { title };
}
