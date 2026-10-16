<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import { useActivityPlay } from '@features/activities/composables/useActivityPlay';
import { isGenerated } from '@features/activities/models/play';
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, CircleQuestionMarkIcon, FileTextIcon, FlagIcon, InfoIcon, ListChecksIcon, PackageOpenIcon } from 'lucide-vue-next';
import { watch } from 'vue';

const { activity, steps, index, current, isFirst, isLast, previous, next, leave, isTicked, toggle, headingOf } = useActivityPlay();

// Each step is a page of its own: open it at its top.
watch(index, () => window.scrollTo({ top: 0 }));

</script>

<template>
    <Container>
        <div v-if="!activity" class="flex justify-center p-8">
            <span class="loading loading-spinner"></span>
        </div>

        <template v-else>
            <div class="sticky top-0 z-10 p-2 flex gap-2">
                <button type="button" class="btn btn-soft btn-square btn-lg" :aria-label="$t('back')"
                    @click="leave">
                    <ArrowLeftIcon />
                </button>

                <h1 class="font-bold truncate my-auto">{{ activity.name }}</h1>
            </div>

            <div v-if="!current" class="flex justify-center gap-2 p-8 opacity-30">
                <CircleQuestionMarkIcon />
                <span>{{ $t('activities.play.empty') }}</span>
            </div>

            <template v-else>
                <Panel class="mx-2 flex-1">
                    <progress v-if="steps.length" class="progress progress-primary" :value="index + 1"
                        :max="steps.length"></progress>

                    <div class="text-center my-auto">
                        <h2 class="text-2xl opacity-30">{{ headingOf(current) }}</h2>
                        <p v-if="isGenerated(current)">{{ $t(`activities.play.generated.${current.kind}`) }}</p>
                        <div v-if="current.description" v-html="current.description" class="text-4xl"></div>
                    </div>

                    <div v-if="current.actions.length">
                        <h3 class="text-sm opacity-60 flex items-center gap-1">
                            <ListChecksIcon class="size-4" /> {{ $t('activities.steps.fields.actions.title') }}
                        </h3>
                        <ul class="flex flex-col">
                            <li v-for="(action, actionIndex) in current.actions" :key="actionIndex">
                                <label class="flex items-center gap-2 py-1 cursor-pointer">
                                    <input type="checkbox" class="checkbox checkbox-primary"
                                        :checked="isTicked(current, actionIndex)"
                                        @change="toggle(current, actionIndex)" />
                                    <span :class="{ 'line-through opacity-50': isTicked(current, actionIndex) }">{{
                                        action }}</span>
                                </label>
                            </li>
                        </ul>
                    </div>

                    <div v-if="current.tips.length" class="flex flex-col gap-2">
                        <h3 class="text-sm opacity-60 flex items-center gap-1">
                            <InfoIcon class="size-4" /> {{ $t('activities.tips.title') }}
                        </h3>
                        <div v-for="tip in current.tips" :key="tip.id" role="alert"
                            class="alert alert-info alert-soft items-start">
                            <div>
                                <b>{{ tip.name }}</b>
                                <div v-html="tip.description"></div>
                            </div>
                        </div>
                    </div>

                    <div v-if="current.materials.length">
                        <h3 class="text-sm opacity-60 flex items-center gap-1">
                            <PackageOpenIcon class="size-4" /> {{ $t('activities.steps.fields.materials.title') }}
                        </h3>
                        <div class="flex flex-wrap gap-1">
                            <span v-for="material in current.materials" :key="material.id" class="badge">
                                {{ material.name }}
                                <span v-if="material.quantity" class="opacity-60">{{ material.quantity }}</span>
                            </span>
                        </div>
                    </div>

                    <div v-if="current.resources.length">
                        <h3 class="text-sm opacity-60 flex items-center gap-1">
                            <FileTextIcon class="size-4" /> {{ $t('activities.steps.fields.resources.title') }}
                        </h3>
                        <div class="flex flex-wrap gap-1">
                            <a v-for="resource in current.resources" :key="resource.id" class="btn btn-sm"
                                :href="resource.url" target="_blank" rel="noopener">
                                <FileTextIcon class="size-4" /> {{ resource.name }}
                            </a>
                        </div>
                    </div>
                </Panel>

                <div class="sticky bottom-14 flex gap-4 justify-center p-2 mt-auto">
                    <button type="button" class="btn btn-soft btn-square btn-lg"
                        :aria-label="$t('activities.play.previous')" :disabled="isFirst" @click="previous">
                        <ChevronLeftIcon />
                    </button>
                    <button v-if="!isLast" type="button" class="btn btn-primary btn-square btn-lg"
                        :aria-label="$t('activities.play.next')" @click="next">
                        <ChevronRightIcon />
                    </button>
                    <button v-else type="button" class="btn btn-success btn-square btn-lg"
                        :aria-label="$t('activities.play.finish')" @click="leave">
                        <FlagIcon />
                    </button>
                </div>
            </template>
        </template>
    </Container>
</template>
