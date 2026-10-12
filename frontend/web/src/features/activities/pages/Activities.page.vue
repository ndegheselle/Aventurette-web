<script setup lang="ts">
import Pagination from '@chapelure/ui/data/Pagination.vue';
import SearchInput from '@chapelure/ui/data/SearchInput.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import { useActivitiesList } from '@features/activities/composables/useActivitiesList';
import { routesNames } from '@features/activities/routes';
import { CakeIcon, CircleQuestionMarkIcon, ClockIcon } from 'lucide-vue-next';

const { paginated, cards, search, refresh } = useActivitiesList();
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

        <div v-else class="flex-1 grid content-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
            <RouterLink v-for="{ activity, ageLabel, totalMinutes } in cards" :key="activity.id"
                class="card bg-base-200 border border-base-content/5 hover:shadow-lg"
                :to="{ name: routesNames.page, params: { id: activity.id } }">

                <figure>
                    <img class="w-full h-32 object-cover" src="https://placeholder.pagebee.io/api/plain/320/128" />
                </figure>
                <div class="card-body">
                    <h2 class="card-title">{{ activity.name }}</h2>
                    <div class="flex flex-wrap gap-1">
                        <span class="badge badge-soft" :title="$t('activities.fields.age')">
                            <CakeIcon class="size-3" />
                            {{ $t(ageLabel.key, ageLabel.params) }}
                        </span>
                        <span v-if="totalMinutes" class="badge badge-soft"
                            :title="$t('activities.fields.totalTime')">
                            <ClockIcon class="size-3" />
                            {{ $t('activities.minutes', { minutes: totalMinutes }) }}
                        </span>
                    </div>
                    <p class="text-xs line-clamp-3" v-html="activity.description"></p>
                </div>
            </RouterLink>
        </div>

        <Pagination v-if="paginated.options.perPage < paginated.total" v-model:page="paginated.options.page"
            v-model:perPage="paginated.options.perPage" :total="paginated.total" @change="refresh" />
    </Container>
</template>
