<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import { attributeIcon } from '@features/activities/composables/attributeIcons';
import { useCatalogue } from '@features/admin/composables/useCatalogue';
import { takesOptions } from '@features/activities/model/attribute';
import { FolderTreeIcon, TriangleAlertIcon } from 'lucide-vue-next';

/**
 * The attribute catalogue, whole: every group, the attributes defined under it, and each
 * attribute's vocabulary. Read-only — editing it is the PocketBase Dashboard's, or a seed
 * migration's.
 */
const { catalogue, attributes, options } = useCatalogue();
</script>

<template>
    <Container>
        <div class="flex items-center gap-2 py-2">
            <FolderTreeIcon />
            <h1 class="text-2xl">{{ $t('admin.catalogue.title') }}</h1>
            <span class="badge badge-ghost ms-auto">
                {{ $t('admin.catalogue.counts', {
                    groups: catalogue.length, attributes: attributes.length, options,
                }) }}
            </span>
        </div>

        <Panel v-for="entry in catalogue" :key="entry.group?.id ?? 'ungrouped'">
            <div class="flex items-baseline gap-2">
                <h2 class="text-xl">{{ entry.group?.name ?? $t('admin.catalogue.ungrouped') }}</h2>
                <code v-if="entry.group" class="text-xs opacity-60">{{ entry.group.slug }}</code>
                <span class="text-xs opacity-60 ms-auto">
                    {{ $t('admin.catalogue.attributeCount', entry.attributes.length) }}
                </span>
            </div>

            <p v-if="!entry.attributes.length" class="text-sm opacity-60">
                {{ $t('admin.catalogue.noAttributes') }}
            </p>

            <div v-for="attribute in entry.attributes" :key="attribute.id"
                class="border-t border-base-content/10 pt-2">
                <div class="flex items-baseline gap-2 flex-wrap">
                    <component :is="attributeIcon(attribute.slug)" class="icon-sm self-center" />
                    <b>{{ attribute.name }}</b>
                    <code class="text-xs opacity-60">{{ attribute.slug }}</code>
                    <span class="badge badge-sm badge-soft badge-primary">
                        {{ $t(`admin.catalogue.types.${attribute.type}`) }}
                    </span>
                </div>

                <!-- A vocabulary is the point of the screen: shown whole, not counted. -->
                <div v-if="attribute.options.length" class="flex flex-wrap gap-1 mt-1">
                    <span v-for="option in attribute.options" :key="option.id"
                        class="badge badge-sm badge-ghost" :title="option.value">
                        {{ option.label }}
                    </span>
                </div>
                <!-- Only a choice type is missing something when it has no options; the rest
                     are typed in and never had a vocabulary. -->
                <p v-else-if="takesOptions(attribute)" class="text-xs text-warning mt-1 flex items-center gap-1">
                    <TriangleAlertIcon class="icon-sm" /> {{ $t('admin.catalogue.noOptions') }}
                </p>
            </div>
        </Panel>
    </Container>
</template>
