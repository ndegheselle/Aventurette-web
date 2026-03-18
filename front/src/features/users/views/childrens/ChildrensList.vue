<script setup lang="ts">
import ListPaginatedSearch from '@common/components/data/ListPaginatedSearch.vue';
import { usePageActions } from '@common/composables/data/pageActions';
import { useTemplateRef } from 'vue';
import { childrens } from '@features/users/data/childrens';
const modalRef = useTemplateRef('modal');
const { list, total, remove, create, edit, refresh } = usePageActions(childrens, (el) => modalRef?.value?.show(el));

</script>

<template>
    <div class="container mx-auto flex flex-col my-2">
        <div class="bg-base-200 rounded-box">
            <svg viewBox="0 0 100 100" width="80px">
                <circle cx="50" cy="50" r="30" />
                <rect width="100" height="50" x="0" y="50" ry="20" />
            </svg>
        </div>
        <h1>Childrens</h1>
        <ListPaginatedSearch>

        </ListPaginatedSearch>
    </div>
</template>