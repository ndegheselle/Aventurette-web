<script setup lang="ts">
import { computed, watch } from 'vue';

const capacityOptions = [5, 10, 25, 50, 100];
const page = defineModel<number>('page', { default: 1 });
const perPage = defineModel<number>('perPage', { default: 25 });
const total = defineModel<number>('total', { default: 25 }); 

const totalPages = computed(() =>
    Math.max(1, Math.ceil(total.value / perPage.value))
);

const firstElement = computed(() => {
  return (page.value - 1) * perPage.value + 1;
});

const lastElement = computed(() => {
  return Math.min(page.value * perPage.value, total.value);
});

// Guard to ensure page never exceeds totalPages
watch(
  [() => page.value, totalPages],
  ([currentPage, maxPages]) => {
    if (currentPage > maxPages) {
      page.value = maxPages;
    }
  },
  { immediate: true }
);
</script>

<template>
    <div class="flex w-full">
        <div class="join">
            <button class="join-item btn btn-sm" :class="{ 'btn-disabled': page <= 1 }" aria-label="Première page"
                @click="page = 1">
                <i class="fa-solid fa-backward-step"></i>
            </button>
            <button class="join-item btn btn-sm" :class="{ 'btn-disabled': page <= 1 }" aria-label="Page précédente"
                @click="page = page - 1">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
            <span class="join-item btn btn-sm">
                {{ page }} / {{ totalPages }}
            </span>
            <button class="join-item btn btn-sm" :class="{ 'btn-disabled': page >= totalPages }"
                aria-label="Page suivante" @click="page = page + 1">
                <i class="fa-solid fa-chevron-right"></i>
            </button>
            <button class="join-item btn btn-sm" :class="{ 'btn-disabled': page >= totalPages }"
                aria-label="Dernière page" @click="page = totalPages">
                <i class="fa-solid fa-forward-step"></i>
            </button>
        </div>

        <span class="ms-auto opacity-50 text-sm my-auto hidden md:inline">{{ firstElement }} - {{ lastElement }} de {{ total }}</span>
        <select v-model="perPage" class="select w-18 select-sm ms-auto md:ms-2">
            <option v-for="option in capacityOptions" :key="option" :value="option">
                {{ option }}
            </option>
        </select>
    </div>
</template>