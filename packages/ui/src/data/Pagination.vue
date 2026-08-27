<!--
    Pager for a server-side list.

    `page` and `perPage` are two-way (the control owns them); `total` is a plain prop because
    only the server knows it. A `change` event fires whenever a new query is needed.

        <Pagination v-model:page="options.page"
                    v-model:perPage="options.perPage"
                    :total="total"
                    @change="refresh" />
-->
<script setup lang="ts">
import { ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next';
import { computed, watch } from 'vue';

const capacityOptions = [5, 10, 25, 50, 100];

const page = defineModel<number>('page', { default: 1 });
const perPage = defineModel<number>('perPage', { default: 25 });

const { total } = defineProps<{
    total: number;
}>();

const emit = defineEmits<{
    change: [];
}>();

const totalPages = computed(() =>
    Math.max(1, Math.ceil(total / perPage.value))
);

const firstElement = computed(() => (page.value - 1) * perPage.value + 1);
const lastElement = computed(() => Math.min(page.value * perPage.value, total));

function goTo(target: number) {
    const clamped = Math.min(Math.max(target, 1), totalPages.value);
    if (clamped === page.value) return;
    page.value = clamped;
    emit('change');
}

// Changing the page size invalidates the current offset.
watch(perPage, () => {
    page.value = 1;
    emit('change');
});

// Keep the page inside range when the result set shrinks. Re-runs once with page === totalPages,
// which no longer satisfies the condition, so this settles immediately.
watch([page, totalPages], ([currentPage, maxPages]) => {
    if (currentPage > maxPages) {
        page.value = maxPages;
        emit('change');
    }
}, { immediate: true });
</script>

<template>
    <div class="flex w-full">
        <div class="join">
            <button class="join-item btn btn-sm btn-square"
                    :class="{ 'btn-disabled': page <= 1 }"
                    :aria-label="$t('data.pagination.first')"
                    @click="goTo(1)">
                    <ChevronFirstIcon />
            </button>
            <button class="join-item btn btn-sm btn-square"
                    :class="{ 'btn-disabled': page <= 1 }"
                    :aria-label="$t('data.pagination.previous')"
                    @click="goTo(page - 1)">
                    <ChevronLeftIcon />
            </button>
            <span class="join-item btn btn-sm">
                {{ page }} / {{ totalPages }}
            </span>
            <button class="join-item btn btn-sm btn-square"
                    :class="{ 'btn-disabled': page >= totalPages }"
                    :aria-label="$t('data.pagination.next')"
                    @click="goTo(page + 1)">
                    <ChevronRightIcon />
            </button>
            <button class="join-item btn btn-sm btn-square"
                    :class="{ 'btn-disabled': page >= totalPages }"
                    :aria-label="$t('data.pagination.last')"
                    @click="goTo(totalPages)">
                    <ChevronLastIcon />
            </button>
        </div>

        <span class="ms-auto opacity-50 text-sm my-auto hidden md:inline">
            {{ firstElement }} - {{ lastElement }} {{ $t('data.pagination.of') }} {{ total }}
        </span>
        <select v-model="perPage"
                class="select w-18 select-sm ms-auto md:ms-2">
            <option v-for="option in capacityOptions"
                    :key="option"
                    :value="option">
                {{ option }}
            </option>
        </select>
    </div>
</template>
