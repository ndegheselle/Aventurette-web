<!--
    Pager for a server-side list. Re-query on `change`.

        <Pagination v-model:page="options.page"
                    v-model:perPage="options.perPage"
                    :total="total"
                    @change="refresh" />
-->
<script setup lang="ts">
import { Button } from '@chapelure/ui/shadcn/button';
import { ButtonGroup, ButtonGroupText } from '@chapelure/ui/shadcn/button-group';
import { NativeSelect, NativeSelectOption } from '@chapelure/ui/shadcn/native-select';
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

// Keep the page inside range when the result set shrinks. Settles after one re-run.
watch([page, totalPages], ([currentPage, maxPages]) => {
    if (currentPage > maxPages) {
        page.value = maxPages;
        emit('change');
    }
}, { immediate: true });
</script>

<template>
    <div class="flex w-full items-center">
        <ButtonGroup>
            <Button variant="outline" size="icon-sm"
                    :disabled="page <= 1"
                    :aria-label="$t('data.pagination.first')"
                    @click="goTo(1)">
                <ChevronFirstIcon />
            </Button>
            <Button variant="outline" size="icon-sm"
                    :disabled="page <= 1"
                    :aria-label="$t('data.pagination.previous')"
                    @click="goTo(page - 1)">
                <ChevronLeftIcon />
            </Button>
            <ButtonGroupText class="h-8 bg-background">
                {{ page }} / {{ totalPages }}
            </ButtonGroupText>
            <Button variant="outline" size="icon-sm"
                    :disabled="page >= totalPages"
                    :aria-label="$t('data.pagination.next')"
                    @click="goTo(page + 1)">
                <ChevronRightIcon />
            </Button>
            <Button variant="outline" size="icon-sm"
                    :disabled="page >= totalPages"
                    :aria-label="$t('data.pagination.last')"
                    @click="goTo(totalPages)">
                <ChevronLastIcon />
            </Button>
        </ButtonGroup>

        <span class="ms-auto hidden text-sm text-muted-foreground md:inline">
            {{ firstElement }} - {{ lastElement }} {{ $t('data.pagination.of') }} {{ total }}
        </span>
        <NativeSelect v-model="perPage"
                      class="ms-auto w-20 md:ms-2 [&_select]:h-8">
            <NativeSelectOption v-for="option in capacityOptions"
                                :key="option"
                                :value="option">
                {{ option }}
            </NativeSelectOption>
        </NativeSelect>
    </div>
</template>
