<script setup lang="ts" generic="T extends BaseEntity">
import Pagination from '@common/components/data/Pagination.vue';
import type { BaseEntity, PaginationOptions } from '@api/crud';
import { debounce } from '@common/utils/debounce';
import { SearchIcon } from 'lucide-vue-next';
import { onMounted, reactive, ref, watch } from 'vue';

const props = withDefaults(defineProps<{
    selected: T | null;
    total: number;
    items: T[];
    /**
     * Hide pagination if the total is inferior or equal to the [total] number of [items]
     */
    hidePagination: boolean;
    /**
     * Allow selection of an item
     */
    withSelection: boolean;
}>(), {
    selected: null,
    total: 0,
    withSelection: true,
    hidePagination: true,
});

const emit = defineEmits<{
    (e: 'update:selected', value: T | null): void;
    (e: 'refresh', search: string, pagination: PaginationOptions): void;
}>();

let search = "";
const pagination = reactive<PaginationOptions>({
    page: 1,
    perPage: 5,
});
const selected = ref<T | null>(props.selected);

defineSlots<{
    actions(): any;
    row(props: { item: T }): any;
}>();

async function refresh() {
    emit('refresh', search, pagination);
}

async function select(item: T) {
    if (props.withSelection == false)
        return;

    if (selected.value?.id === item.id) {
        selected.value = null;
        emit('update:selected', null);
        return;
    }
    selected.value = item;
    emit('update:selected', item);
}

const debouncedLoad = debounce(refresh, 300);
onMounted(refresh);

// Watch for external changes to the selected prop
watch(() => props.selected, (newVal) => {
    selected.value = newVal;
});
</script>

<template>
    <div class="flex flex-col">
        <!-- Search Input -->
        <div class="flex">
            <label class="input input-sm">
                <SearchIcon class="opacity-50" />
                <input @input="debouncedLoad"
                       type="search"
                       :placeholder="$t('actions.search')"
                       v-model="search" />
            </label>
            <div class="ms-auto">
                <slot name="actions" />
            </div>
        </div>

        <!-- List Container -->
        <ul class="list bg-base-100 rounded-box border border-base-content/5 mt-1 max-h-64 overflow-y-auto">
            <!-- Empty State -->
            <li class="flex h-32"
                v-if="items.length === 0">
                <span class="opacity-50 m-auto">{{ $t("data.noResult") }}</span>
            </li>

            <!-- List Items -->
            <li v-for="item in items"
                :key="item.id"
                class="list-row duration-300"
                :class="{ 'bg-base-300': selected?.id === item.id, 'cursor-pointer': withSelection }"
                @click="select(item)">
                <slot name="row"
                      :item="item" />
            </li>
        </ul>

        <!-- Pagination -->
        <Pagination v-if="hidePagination && total <= items.length"
                    class="mt-1"
                    v-model:page="pagination.page"
                    v-model:total="props.total"
                    v-model:capacity="pagination.perPage"
                    @change="refresh" />
    </div>
</template>