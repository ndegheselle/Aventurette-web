<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import { useActivityPlay } from '@features/activities/composables/useActivityPlay';
import { isGenerated } from '@features/activities/model/play';
import { stepNumber } from '@features/activities/model/step';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { ArrowLeftIcon, ArrowRightIcon, CircleQuestionMarkIcon, ClockIcon, FileTextIcon, FlagIcon, ListChecksIcon, PackageOpenIcon } from 'lucide-vue-next';

const { activity, steps, index, current, isFirst, isLast, goTo, previous, next, isTicked, toggle } = useActivityPlay();
</script>
<template>
    <Container v-if="activity">
        <div class="sticky top-0 flex items-center gap-2 py-1 bg-base-100 z-10">
            <RouterLink class="btn btn-ghost"
                        :to="{ name: activitiesRoutesNames.page, params: { id: activity.id } }">
                <ArrowLeftIcon /> {{ $t('actions.back') }}
            </RouterLink>
            <h1 class="text-lg truncate">{{ activity.name }}</h1>
            <span v-if="steps.length"
                  class="ms-auto text-sm opacity-60 tabular-nums whitespace-nowrap">
                {{ $t('activities.play.progress', { current: index + 1, total: steps.length }) }}
            </span>
        </div>

        <div v-if="!current"
             class="flex flex-1 p-4 opacity-30 tracking-wide">
            <div class="flex m-auto">
                <CircleQuestionMarkIcon class="mr-2 my-auto" />
                <span>{{ $t('activities.play.empty') }}</span>
            </div>
        </div>

        <template v-else>
            <progress class="progress progress-primary"
                      :value="index + 1"
                      :max="steps.length"></progress>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-2 items-start">
                <div class="hidden lg:block">
                    <Panel>
                        <ul class="steps steps-vertical">
                            <li v-for="(step, stepIndex) in steps"
                                :key="step.key"
                                class="step"
                                :class="{ 'step-primary': stepIndex <= index }">
                                <button class="text-start hover:underline"
                                        :class="{ 'font-bold': stepIndex === index }"
                                        @click="goTo(stepIndex)">
                                    {{ step.title || $t(`activities.steps.kind.${step.kind}`) }}
                                </button>
                            </li>
                        </ul>
                    </Panel>
                </div>

                <Panel class="lg:col-span-3">
                    <div class="flex items-start gap-3">
                        <div class="text-5xl font-thin opacity-30 tabular-nums">{{ stepNumber(index) }}</div>
                        <div class="flex flex-col gap-1">
                            <h2 class="text-2xl">{{ current.title || $t(`activities.steps.kind.${current.kind}`) }}</h2>
                            <div class="flex flex-wrap gap-1">
                                <span v-if="current.title"
                                      class="badge badge-ghost">
                                    {{ $t(`activities.steps.kind.${current.kind}`) }}
                                </span>
                                <span v-if="current.duration"
                                      class="badge"
                                      :title="$t('activities.steps.fields.duration')">
                                    <ClockIcon class="size-3" />
                                    {{ $t('activities.minutes', { minutes: current.duration }) }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <p v-if="isGenerated(current)">{{ $t(`activities.play.generated.${current.kind}`) }}</p>
                    <div v-if="current.description"
                         v-html="current.description"></div>

                    <div v-if="current.actions.length">
                        <h3 class="text-sm opacity-60 flex items-center gap-1">
                            <ListChecksIcon class="size-4" /> {{ $t('activities.steps.fields.actions.title') }}
                        </h3>
                        <ul class="flex flex-col">
                            <li v-for="(action, actionIndex) in current.actions"
                                :key="actionIndex">
                                <label class="flex items-center gap-2 py-1 cursor-pointer">
                                    <input type="checkbox"
                                           class="checkbox checkbox-primary"
                                           :checked="isTicked(current, actionIndex)"
                                           @change="toggle(current, actionIndex)" />
                                    <span :class="{ 'line-through opacity-50': isTicked(current, actionIndex) }">{{ action }}</span>
                                </label>
                            </li>
                        </ul>
                    </div>

                    <div v-if="current.materials.length">
                        <h3 class="text-sm opacity-60 flex items-center gap-1">
                            <PackageOpenIcon class="size-4" /> {{ $t('activities.steps.fields.materials.title') }}
                        </h3>
                        <div class="flex flex-wrap gap-1">
                            <span v-for="material in current.materials"
                                  :key="material.id"
                                  class="badge">
                                {{ material.name }}
                                <span v-if="material.quantity"
                                      class="opacity-60">{{ material.quantity }}</span>
                            </span>
                        </div>
                    </div>

                    <div v-if="current.resources.length">
                        <h3 class="text-sm opacity-60 flex items-center gap-1">
                            <FileTextIcon class="size-4" /> {{ $t('activities.steps.fields.resources.title') }}
                        </h3>
                        <div class="flex flex-wrap gap-1">
                            <a v-for="resource in current.resources"
                               :key="resource.id"
                               class="btn btn-sm"
                               :href="resource.url"
                               target="_blank"
                               rel="noopener">
                                <FileTextIcon class="size-4" /> {{ resource.name }}
                            </a>
                        </div>
                    </div>
                </Panel>
            </div>

            <div class="sticky bottom-0 flex gap-2 py-1 bg-base-100">
                <button class="btn"
                        :disabled="isFirst"
                        @click="previous">
                    <ArrowLeftIcon /> {{ $t('activities.play.previous') }}
                </button>
                <button v-if="!isLast"
                        class="btn btn-primary ms-auto"
                        @click="next">
                    {{ $t('activities.play.next') }} <ArrowRightIcon />
                </button>
                <RouterLink v-else
                            class="btn btn-success ms-auto"
                            :to="{ name: activitiesRoutesNames.page, params: { id: activity.id } }">
                    <FlagIcon /> {{ $t('activities.play.finish') }}
                </RouterLink>
            </div>
        </template>
    </Container>
</template>
