<script setup lang="ts" generic="T extends BaseEntity">
import { onMounted, ref } from 'vue';
import { type PaginationOptions, SortDirection } from '@common/database/crud';
import Pagination from '@common/components/data/Pagination.vue';
import { debounce } from '@common/utils/debounce';
import type { BaseEntity } from '@common/data/base';

const { pagination = {
    sortBy: undefined,
    sortDirection: undefined,
    page: 1,
    perPage: 5
} } = defineProps<{
    total: number,
    items: T[],
    pagination?: PaginationOptions
}>();

const search = ref('');

defineSlots<{
    actions(): any;
    /**
     * Header slot for table columns.
     * 
     * Add `data-sort-field="fieldName"` attribute to any `<th>` element to make it sortable.
     * The component will automatically handle click events and display sort indicators.
     * 
     * @example
     * ```vue
     * <template #header>
     *   <th data-sort-field="name">Nom</th>
     *   <th data-sort-field="email">Email</th>
     *   <th>Actions</th>
     * </template>
     * ```
     */
    header(): any;
    row(props: { item: T }): any;
}>();

const emit = defineEmits<{
    refresh: [search: string, pagination: PaginationOptions]
}>()

function handleHeaderClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const th = target.closest('th[data-sort-field]') as HTMLElement;

    if (th) {
        const field = th.dataset.sortField;
        if (field) {
            // Remove data-sort from all th elements
            const allHeaders = th.parentElement?.querySelectorAll('th[data-sort-field]');
            allHeaders?.forEach(header => header.removeAttribute('data-sort'));

            // Update sort state
            if (pagination.sortBy === field) {
                if (pagination.sortDirection === SortDirection.ASC) {
                    pagination.sortDirection = SortDirection.DESC;
                } else if (pagination.sortDirection === SortDirection.DESC) {
                    pagination.sortBy = undefined;
                    pagination.sortDirection = undefined;
                } else {
                    pagination.sortDirection = SortDirection.ASC;
                }
            } else {
                pagination.sortBy = field;
                pagination.sortDirection = SortDirection.ASC;
            }

            // Set data-sort on the clicked header
            if (pagination.sortBy === field) {
                th.setAttribute('data-sort', pagination.sortDirection === SortDirection.ASC ? '+' : '-');
            } else {
                th.removeAttribute('data-sort');
            }

            refresh();
        }
    }
}

async function refresh() {
    emit('refresh', search.value, pagination);
}

const debouncedLoad = debounce(refresh, 300);
onMounted(refresh);
</script>

<template>
    <div class="flex flex-col">
        <div class="flex">
            <label class="input input-sm">
                <i class="fa-solid fa-magnifying-glass opacity-50"></i>
                <input @input="debouncedLoad" type="search" placeholder="Recherche" v-model="search" />
            </label>
            <div class="ms-auto">
                <slot name="actions" />
            </div>
        </div>
        <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 flex-1 mt-1">
            <table class="table table-xs">
                <thead>
                    <tr @click="handleHeaderClick">
                        <slot name="header" />
                    </tr>
                </thead>
                <tbody>
                    <template v-if="items.length">
                        <tr v-for="item in items" :key="item.id">
                            <slot name="row" :item="(item as T)" />
                        </tr>
                    </template>
                    <tr v-else>
                        <td colspan="100" class="text-center opacity-60 py-6">
                            Aucun résultat
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <Pagination class="mt-1" :page="pagination.page" :perPage="pagination.perPage" :total="total"
            @change="refresh" />
    </div>
</template>

<style scoped>
:deep(th[data-sort-field]) {
    cursor: pointer;
    user-select: none;
}

:deep(th[data-sort-field])::after {
    content: '\f0dc';
    font-family: 'Font Awesome 7 Free';
    font-weight: 900;
    float: right;
    opacity: 0.3;
    font-size: 0.75rem;
}

:deep(th[data-sort-field][data-sort="+"])::after {
    content: '\f0de';
    opacity: 1;
}

:deep(th[data-sort-field][data-sort="-"])::after {
    content: '\f0dd';
    opacity: 1;
}
</style>