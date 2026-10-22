<!-- The heart that adds the activity to the user's favorites, or takes it off. Styled by the
     caller: the classes given to it land on the button. -->
<script setup lang="ts">
import { useFavorites } from '@features/activities/composables/useFavorites';
import type { ActivityData } from '@features/activities/models/activity';
import { HeartIcon } from 'lucide-vue-next';
import { computed } from 'vue';

const props = defineProps<{
    activity: ActivityData;
}>();

const { isFavorite, toggle } = useFavorites();
const favorite = computed(() => isFavorite(props.activity.id));
</script>

<template>
    <button type="button"
            :aria-pressed="favorite"
            :aria-label="$t(favorite ? 'activities.actions.unfavorite' : 'activities.actions.favorite')"
            @click="toggle(activity)">
        <HeartIcon :class="{ 'fill-current text-error': favorite }" />
    </button>
</template>
