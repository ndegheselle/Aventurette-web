<script setup lang="ts">
import { attributeIcon } from '@features/activities/composables/attributeIcons';
import { useAttributes } from '@features/activities/composables/useAttributes';
import { valueOf, type ActivityData } from '@features/activities/model/activity';
import { AttributeType, formatAttributeValue } from '@features/activities/model/attribute';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * The activity's measured attributes — an age range, a duration, an energy level — as a row of
 * badges. What it shows is the catalogue's, not this file's: a new attribute of one of these
 * types appears here on its own.
 *
 * The keyword vocabularies are `<ActivityKeywordsDisplay>`'s; they are too many for a badge row.
 */
const { t } = useI18n();
const { activity } = defineProps<{ activity?: ActivityData }>();

const { attributes } = useAttributes();

const measured = computed(() => attributes.value
    .filter(attribute => attribute.type !== AttributeType.multi_choice)
    .map(attribute => ({
        key: attribute.id,
        icon: attributeIcon(attribute.slug),
        name: attribute.name,
        display: formatAttributeValue(t, attribute, valueOf(activity, attribute)),
    }))
    .filter(badge => badge.display));
</script>

<template>
    <div class="flex flex-wrap gap-1">
        <span v-for="badge in measured" :key="badge.key" class="badge badge-soft badge-primary"
            :title="badge.name">
            <component :is="badge.icon" /> {{ badge.display }}
        </span>
    </div>
</template>
