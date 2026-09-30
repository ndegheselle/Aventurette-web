<script setup lang="ts">
import Pagination from '@chapelure/ui/data/Pagination.vue';
import SearchInput from '@chapelure/ui/data/SearchInput.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import { rangeLabel } from '@chapelure/ui/inputs/range';
import { useActivitiesList } from '@features/activities/composables/useActivitiesList';
import { rangeEndOf, totalMinutesOf, type ActivityData } from '@features/activities/model/activity';
import { routesNames } from '@features/activities/routes';
import { CakeIcon, CircleQuestionMarkIcon, ClockIcon } from 'lucide-vue-next';

const { paginated, search, refresh } = useActivitiesList();

function ageLabelOf(activity: ActivityData) {
    return rangeLabel(rangeEndOf(activity.audience.ageMin), rangeEndOf(activity.audience.ageMax));
}
</script>

<template>
    <Container>
        <SearchInput @search="() => refresh()" v-model="search" />

        <div v-if="!paginated.items?.length" class="flex flex-1 p-4 opacity-30 tracking-wide">
            <div class="flex m-auto">
                <CircleQuestionMarkIcon class="mr-2 my-auto" />
                <span>{{ $t('data.noData') }}</span>
            </div>
        </div>

        <div v-else class="flex flex-1 flex-wrap content-start gap-2">
            <RouterLink v-for="item in paginated.items" :key="item.id"
                class="w-64 card bg-base-200 border border-base-content/5 shadow-sm hover:border-primary transitions transition-colors"
                :to="{ name: routesNames.page, params: { id: item.id } }">

                <figure>
                    <img class="w-full h-32 object-cover" src="https://placeholder.pagebee.io/api/plain/320/128" />
                </figure>
                <div class="card-body">
                    <h2 class="card-title">{{ item.name }}</h2>
                    <div class="flex flex-wrap gap-1">
                        <span class="badge badge-soft" :title="$t('activities.fields.age')">
                            <CakeIcon class="size-3" />
                            {{ $t(ageLabelOf(item).key, ageLabelOf(item).params) }}
                        </span>
                        <span v-if="totalMinutesOf(item)" class="badge badge-soft"
                            :title="$t('activities.fields.totalTime')">
                            <ClockIcon class="size-3" />
                            {{ $t('activities.minutes', { minutes: totalMinutesOf(item) }) }}
                        </span>
                    </div>
                    <p class="text-xs line-clamp-3" v-html="item.description"></p>
                </div>
            </RouterLink>
        </div>

        <Pagination v-if="paginated.options.perPage < paginated.total" v-model:page="paginated.options.page"
            v-model:perPage="paginated.options.perPage" :total="paginated.total" @change="refresh" />
    </Container>
</template>
