import { computed, ref } from 'vue';

export const LIBRARY_PAGE_SIZE = 12;
export const LIBRARY_MAX_PAGES = 3;

// Placeholder until the library has a backend: each "page" is a delay, then PAGE_SIZE more ids.
export function useLibraryFeed() {
    const count = ref(0);
    const loading = ref(false);

    const done = computed(() => count.value >= LIBRARY_PAGE_SIZE * LIBRARY_MAX_PAGES);
    const items = computed(() => Array.from({ length: count.value }, (_, i) => i));

    async function loadMore() {
        if (loading.value || done.value) return;
        loading.value = true;
        await new Promise((resolve) => setTimeout(resolve, 1000));
        count.value += LIBRARY_PAGE_SIZE;
        loading.value = false;
    }

    return { items, loading, done, loadMore };
}
