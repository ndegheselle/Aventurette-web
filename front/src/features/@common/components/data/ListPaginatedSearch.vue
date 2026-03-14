<script setup lang="ts" generic="T extends BaseEntity">
import { reactive, ref, watch, onMounted } from 'vue';
import type { PaginationOptions } from '@common/database/crud';
import Pagination from '@common/components/data/Pagination.vue';
import { debounce } from '@common/utils/debounce';
import type { BaseEntity } from '@common/data/base';

const props = defineProps<{
    selected: T | null;
    total: number;
    items: T[];
}>();

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
    row(props: { item: T }): any;
}>();

async function refresh() {
    emit('refresh', search, pagination);
}

async function select(item: T) {
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
        <label class="input input-sm w-full">
            <i class="fa-solid fa-magnifying-glass opacity-50"></i>
            <input @input="debouncedLoad" type="search" placeholder="Recherche" v-model="search" />
        </label>

        <!-- List Container -->
        <ul class="list bg-base-100 rounded-box border border-base-content/5 mt-1 max-h-64 overflow-y-auto">
            <!-- Empty State -->
            <li class="flex h-32" v-if="items.length === 0">
                <span class="opacity-50 m-auto">Aucun résultat</span>
            </li>

            <!-- List Items -->
            <li v-for="item in items" :key="item.id" class="list-row duration-300 cursor-pointer"
                :class="{ 'bg-base-300': selected?.id === item.id }" @click="select(item)">
                <slot name="row" :item="item" />
            </li>
        </ul>

        <!-- Pagination -->
        <Pagination class="mt-1" v-model:page="pagination.page" v-model:total="props.total"
            v-model:capacity="pagination.perPage" @change="refresh" />
    </div>
</template>