<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import { useActivityPlay } from '@features/activities/composables/useActivityPlay';
import Supplies from '@features/activities/ui/activity/_parts/supplies.vue';
import StepTips from '@features/activities/ui/activity/_parts/tips.vue';
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, CircleQuestionMarkIcon, FlagIcon } from 'lucide-vue-next';
import { watch } from 'vue';

const { activity, steps, index, current, isFirst, isLast, previous, next, leave, finish, headingOf } = useActivityPlay();

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
                        <div v-if="current.description" v-html="current.description" class="text-4xl"></div>
                    </div>

                    <Supplies :materials="current.materials" :resources="current.resources" />
                </Panel>

                <div class="flex gap-2 justify-center p-2">
                    <button type="button" class="btn btn-soft btn-square btn-lg"
                        :aria-label="$t('activities.play.previous')" :disabled="isFirst" @click="previous">
                        <ChevronLeftIcon />
                    </button>
                    <StepTips :key="current.id" :tips="current.tips" />
                    <button v-if="!isLast" type="button" class="btn btn-primary btn-square btn-lg"
                        :aria-label="$t('activities.play.next')" @click="next">
                        <ChevronRightIcon />
                    </button>
                    <button v-else type="button" class="btn btn-primary btn-square btn-lg"
                        :aria-label="$t('activities.play.finish')" @click="finish">
                        <FlagIcon />
                    </button>
                </div>
            </template>
        </template>
    </Container>
</template>
