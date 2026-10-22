<!-- After a run: well done, then what the user thought of it. -->
<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import { useActivityFeedback } from '@features/activities/composables/useActivityFeedback';
import Confetti from '@features/activities/ui/activity/_parts/confetti.vue';
import FavoriteButton from '@features/activities/ui/activity/_parts/favorite.vue';
import { ThumbsUpIcon } from 'lucide-vue-next';

const { activity, liked, comment, isBusy, toggleLike, leave } = useActivityFeedback();
</script>

<template>
    <Container>
        <div v-if="!activity" class="flex justify-center p-8">
            <span class="loading loading-spinner"></span>
        </div>

        <template v-else>
            <div class="flex-1 flex flex-col items-center justify-center gap-6 p-4 text-center">
                <Confetti class="size-32" />

                <div>
                    <h1 class="text-3xl font-bold">{{ $t('activities.feedback.bravo') }}</h1>
                    <p class="opacity-60">{{ $t('activities.feedback.finished', { name: activity.name }) }}</p>
                </div>

                <div class="flex gap-4">
                    <button type="button" class="btn btn-square btn-lg"
                            :aria-label="$t('activities.feedback.like')" :aria-pressed="liked" :disabled="isBusy"
                            @click="toggleLike">
                        <ThumbsUpIcon :class="{ 'fill-current text-primary': liked }" />
                    </button>
                    <FavoriteButton :activity="activity" class="btn btn-square btn-lg" />
                </div>

                <label class="w-full max-w-md flex flex-col gap-1 text-left">
                    <span class="label">{{ $t('activities.feedback.comment') }}</span>
                    <textarea v-model="comment" class="textarea w-full" rows="4" maxlength="2000"
                              :placeholder="$t('activities.feedback.commentPlaceholder')"></textarea>
                </label>
            </div>

            <div class="p-2">
                <button type="button" class="btn btn-primary btn-lg w-full" :disabled="isBusy" @click="leave">
                    {{ $t('activities.feedback.leave') }}
                </button>
            </div>
        </template>
    </Container>
</template>
