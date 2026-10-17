<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import { useActivityPlay } from '@features/activities/composables/useActivityPlay';
import { isGenerated } from '@features/activities/models/play';
import StepTips from '@features/activities/ui/activity/_parts/tips.vue';
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, CircleQuestionMarkIcon, FileTextIcon, FlagIcon, ListChecksIcon, PackageOpenIcon } from 'lucide-vue-next';
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
                <button type="button" class="btn btn-soft btn-square btn-lg" :aria-label="$t('back')" @click="leave">
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

                    <div class="text-center my-auto flex flex-col gap-2">
                        <h2 class="text-2xl opacity-30">{{ headingOf(current) }}</h2>
                        <p v-if="isGenerated(current)" class="text-4xl">{{ $t(`activities.play.generated.${current.kind}`) }}</p>
                        <div v-if="current.description" v-html="current.description" class="text-4xl"></div>

                        <ul v-if="current.actions.length" class="flex flex-col mx-auto">
                            <li v-for="(action, actionIndex) in current.actions" :key="actionIndex">
                                <label class="flex items-center gap-2 py-1 cursor-pointer">
                                    <input type="checkbox" class="checkbox" :checked="isTicked(current, actionIndex)"
                                        @change="toggle(current, actionIndex)" />
                                    <span :class="{ 'line-through opacity-50': isTicked(current, actionIndex) }">{{
                                        action }}</span>
                                </label>
                            </li>
                        </ul>

                    </div>

                    <div v-if="current.materials.length" class="flex flex-wrap gap-1">
                        <span v-for="material in current.materials" :key="material.id" class="badge">
                            {{ material.name }}
                            <span v-if="material.quantity" class="opacity-60">{{ material.quantity }}</span>
                        </span>
                    </div>

                    <div v-if="current.resources.length" class="flex flex-wrap gap-1">
                        <a v-for="resource in current.resources" :key="resource.id" class="btn btn-sm"
                            :href="resource.url" target="_blank" rel="noopener">
                            <FileTextIcon class="size-4" /> {{ resource.name }}
                        </a>
                    </div>
                </Panel>

                <div class="flex gap-2 justify-center p-2">
                    <button type="button" class="btn btn-soft btn-square btn-lg"
                        :aria-label="$t('activities.play.previous')" :disabled="isFirst" @click="previous">
                        <ChevronLeftIcon />
                    </button>
                    <StepTips :key="current.key" :tips="current.tips" />
                    <button v-if="!isLast" type="button" class="btn btn-primary btn-square btn-lg"
                        :aria-label="$t('activities.play.next')" @click="next">
                        <ChevronRightIcon />
                    </button>
                    <button v-else type="button" class="btn btn-primary btn-square btn-lg"
                        :aria-label="$t('activities.play.finish')" @click="leave">
                        <FlagIcon />
                    </button>
                </div>
            </template>
        </template>
    </Container>
</template>
