<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import { Button } from '@chapelure/ui/shadcn/button';
import { Progress } from '@chapelure/ui/shadcn/progress';
import { Spinner } from '@chapelure/ui/shadcn/spinner';
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
            <Spinner class="size-6" />
        </div>

        <template v-else>
            <div class="sticky top-0 z-10 p-2 flex gap-2">
                <Button type="button" variant="secondary" size="icon-lg" :aria-label="$t('back')" @click="leave">
                    <ArrowLeftIcon />
                </Button>

                <h1 class="font-bold truncate my-auto">{{ activity.name }}</h1>
            </div>

            <div v-if="!current" class="flex justify-center gap-2 p-8 text-muted-foreground">
                <CircleQuestionMarkIcon />
                <span>{{ $t('activities.play.empty') }}</span>
            </div>

            <template v-else>
                <Panel class="mx-2 flex-1">
                    <!-- shadcn's bar reads a percentage. -->
                    <Progress v-if="steps.length" :model-value="(index + 1) * 100 / steps.length" />

                    <div class="text-center my-auto flex flex-col gap-2">
                        <h2 class="text-2xl text-muted-foreground">{{ headingOf(current) }}</h2>
                        <div v-if="current.description" v-html="current.description" class="text-4xl"></div>
                    </div>

                    <Supplies :materials="current.materials" :resources="current.resources" />
                </Panel>

                <!-- Sticks above the mobile dock (`bottom-14`), as the activity page's actions do,
                     so a long step never pushes the buttons out of view. -->
                <div class="sticky bottom-14 md:bottom-0 z-10 flex gap-2 justify-center p-2">
                    <Button type="button" variant="secondary" size="icon-lg"
                        :aria-label="$t('activities.play.previous')" :disabled="isFirst" @click="previous">
                        <ChevronLeftIcon />
                    </Button>
                    <StepTips :key="current.id" :tips="current.tips" />
                    <Button v-if="!isLast" type="button" size="icon-lg"
                        :aria-label="$t('activities.play.next')" @click="next">
                        <ChevronRightIcon />
                    </Button>
                    <Button v-else type="button" size="icon-lg"
                        :aria-label="$t('activities.play.finish')" @click="finish">
                        <FlagIcon />
                    </Button>
                </div>
            </template>
        </template>
    </Container>
</template>
