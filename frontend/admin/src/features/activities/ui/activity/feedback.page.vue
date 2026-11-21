<!-- After a run: well done, then what the user thought of it. -->
<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import { Button } from '@chapelure/ui/shadcn/button';
import { Label } from '@chapelure/ui/shadcn/label';
import { Spinner } from '@chapelure/ui/shadcn/spinner';
import { Textarea } from '@chapelure/ui/shadcn/textarea';
import { useActivityFeedback } from '@features/activities/composables/useActivityFeedback';
import Confetti from '@features/activities/ui/activity/_parts/confetti.vue';
import FavoriteButton from '@features/activities/ui/activity/_parts/favorite.vue';
import { ThumbsUpIcon } from 'lucide-vue-next';

const { activity, liked, comment, isBusy, toggleLike, leave } = useActivityFeedback();
</script>

<template>
    <Container>
        <div v-if="!activity" class="flex justify-center p-8">
            <Spinner class="size-6" />
        </div>

        <template v-else>
            <div class="flex-1 flex flex-col items-center justify-center gap-6 p-4 text-center">
                <Confetti class="size-32" />

                <div>
                    <h1 class="text-3xl font-bold">{{ $t('activities.feedback.bravo') }}</h1>
                    <p class="text-muted-foreground">{{ $t('activities.feedback.finished', { name: activity.name }) }}</p>
                </div>

                <div class="flex gap-4">
                    <Button type="button" variant="outline" size="icon-lg"
                            :aria-label="$t('activities.feedback.like')" :aria-pressed="liked" :disabled="isBusy"
                            @click="toggleLike">
                        <ThumbsUpIcon :class="{ 'fill-current text-primary': liked }" />
                    </Button>
                    <Button as-child variant="outline" size="icon-lg">
                        <FavoriteButton :activity="activity" />
                    </Button>
                </div>

                <div class="w-full max-w-md flex flex-col gap-2 text-left">
                    <Label for="feedback-comment">{{ $t('activities.feedback.comment') }}</Label>
                    <Textarea id="feedback-comment" v-model="comment" class="min-h-24" rows="4" maxlength="2000"
                              :placeholder="$t('activities.feedback.commentPlaceholder')" />
                </div>
            </div>

            <div class="p-2">
                <Button type="button" size="lg" class="w-full" :disabled="isBusy" @click="leave">
                    {{ $t('activities.feedback.leave') }}
                </Button>
            </div>
        </template>
    </Container>
</template>
