<!-- Example : <InfiniteScroll :loading="loading" :done="!hasMore" @load="loadMore"> ...items... </InfiniteScroll>
     Emits `load` when the bottom is about to come into view (`margin` px early). The caller owns `loading` (true until the page
     has been appended) and `done` (nothing left to fetch: stops the events and hides the spinner). -->
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{
    loading?: boolean;
    done?: boolean;
    /** How many px before the bottom comes into view `load` is emitted. Defaults to 400. */
    margin?: number;
}>();

const emit = defineEmits<{
    load: [];
}>();

const sentinel = ref<HTMLElement>();
let observer: IntersectionObserver | undefined;

function onIntersect([entry]: IntersectionObserverEntry[]) {
    if (entry?.isIntersecting && !props.loading && !props.done) emit('load');
}

// An observer only reports changes: when a load ends with the bottom still in view, nothing
// would fire again. Observing afresh makes it report the current state.
function observe() {
    if (!sentinel.value) return;
    observer?.disconnect();
    observer = new IntersectionObserver(onIntersect, { rootMargin: `0px 0px ${props.margin ?? 400}px 0px` });
    observer.observe(sentinel.value);
}

onMounted(observe);
onBeforeUnmount(() => observer?.disconnect());
watch(() => [props.loading, props.done], observe, { flush: 'post' });
</script>

<template>
    <slot></slot>
    <div v-if="!done" ref="sentinel" class="flex justify-center py-4 min-h-12">
        <span v-if="loading" class="loading loading-ring loading-md"></span>
    </div>
</template>
