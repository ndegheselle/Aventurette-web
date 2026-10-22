<!-- The heart that adds the activity to the user's favorites, or takes it off. Styled by the
     caller: the classes given to it land on the button. -->
<script setup lang="ts">
import { useFavorites } from '@features/user/composables/useFavorites';
import { HeartIcon } from 'lucide-vue-next';
import { computed } from 'vue';

const props = defineProps<{
    activityId: string;
}>();

const { isFavorite, toggle } = useFavorites();
const favorite = computed(() => isFavorite(props.activityId));
</script>

<template>
    <button type="button"
            :aria-pressed="favorite"
            :aria-label="$t(favorite ? 'activities.actions.unfavorite' : 'activities.actions.favorite')"
            @click="toggle(activityId)">
        <HeartIcon :class="{ 'fill-current text-error': favorite }" />
    </button>
</template>
