<!-- The user's planning: a calendar of the activities they planned. Tapping one opens a sheet to
     go to the activity or take the plan off. -->
<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import { useIsMobile } from '@chapelure/ui/layout/useIsMobile';
import ResponsiveModal from '@chapelure/ui/modals/ResponsiveModal.vue';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { usePlanning } from '@features/planning/composables/usePlanning';
import { formatPlanStart } from '@features/planning/models/planning';
import FullCalendar, { type CalendarOptions } from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/vue3/daygrid';
import listPlugin from '@fullcalendar/vue3/list';
import frLocale from '@fullcalendar/vue3/locales/fr';
import classicThemePlugin from '@fullcalendar/vue3/themes/classic';
import timeGridPlugin from '@fullcalendar/vue3/timegrid';
import '@fullcalendar/vue3/skeleton.css';
import '@fullcalendar/vue3/themes/classic/theme.css';
import { EyeIcon, Trash2Icon } from 'lucide-vue-next';
import { computed, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

const calendar = useTemplateRef<InstanceType<typeof FullCalendar>>('calendar');
const { fetchEvents, sheet, selected, select, removeSelected } = usePlanning(calendar);
const { locale } = useI18n();
const { isMobile } = useIsMobile();

// A month grid is unreadable on a phone, and the toolbar does not fit one line: there, the week
// as a list and nothing to switch to.
const options = computed<CalendarOptions>(() => ({
    plugins: [classicThemePlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    locales: [frLocale],
    locale: locale.value,
    initialView: isMobile.value ? 'listWeek' : 'dayGridMonth',
    headerToolbar: isMobile.value
        ? { start: 'title', end: 'prev,next' }
        : { start: 'prev,next today', center: 'title', end: 'dayGridMonth,timeGridWeek,listWeek' },
    height: 'auto',
    events: fetchEvents,
    eventClick: ({ event }) => select(event.id),
}));
</script>

<template>
    <Container>
        <div class="planning p-2">
            <FullCalendar ref="calendar" :options="options" />
        </div>

        <ResponsiveModal :controller="sheet">
            <template #title>{{ selected?.activity?.name }}</template>
            <div v-if="selected" class="flex flex-col gap-4">
                <p>{{ formatPlanStart(selected.start, locale) }}</p>
                <div class="flex justify-end gap-2">
                    <button type="button" class="btn btn-error btn-soft" @click="removeSelected">
                        <Trash2Icon />
                        {{ $t('planning.actions.remove') }}
                    </button>
                    <RouterLink v-if="selected.activity" class="btn btn-primary"
                                :to="{ name: activitiesRoutesNames.activity, params: { id: selected.activity.id } }">
                        <EyeIcon />
                        {{ $t('planning.actions.open') }}
                    </RouterLink>
                </div>
            </div>
        </ResponsiveModal>
    </Container>
</template>

<style scoped>
/* The classic theme's palette, from the daisyUI theme instead of its own: the calendar follows a
   theme switch, light or dark, the way the rest of the app does. */
.planning {
    --fc-classic-button: var(--color-neutral);
    --fc-classic-button-border: var(--color-neutral);
    /* Pressed: the button's own colour, darker, so the light text on it reads in either theme. */
    --fc-classic-button-strong: color-mix(in oklab, var(--color-neutral) 70%, black);
    --fc-classic-button-strong-border: color-mix(in oklab, var(--color-neutral) 70%, black);
    --fc-classic-button-outline: color-mix(in oklab, var(--color-neutral) 50%, transparent);
    --fc-classic-button-foreground: var(--color-neutral-content);

    --fc-classic-primary: var(--color-primary);
    --fc-classic-primary-foreground: var(--color-primary-content);

    --fc-classic-event: var(--color-primary);
    --fc-classic-event-contrast: var(--color-primary-content);
    --fc-classic-background-event: var(--color-success);
    --fc-classic-background-event-opacity: 15%;
    --fc-classic-background-event-foreground-opacity: 50%;
    --fc-classic-highlight: color-mix(in oklab, var(--color-primary) 20%, transparent);
    --fc-classic-today: color-mix(in oklab, var(--color-accent) 15%, transparent);
    --fc-classic-now: var(--color-error);
    --fc-classic-small-dot-width: 8px;
    --fc-classic-large-dot-width: 10px;

    --fc-classic-background: var(--color-base-100);
    --fc-classic-faint: color-mix(in oklab, var(--color-base-content) 4%, transparent);
    --fc-classic-muted: color-mix(in oklab, var(--color-base-content) 8%, transparent);
    --fc-classic-strong: color-mix(in oklab, var(--color-base-content) 14%, transparent);

    --fc-classic-foreground: var(--color-base-content);
    --fc-classic-faint-foreground: color-mix(in oklab, var(--color-base-content) 40%, transparent);
    --fc-classic-muted-foreground: color-mix(in oklab, var(--color-base-content) 60%, transparent);

    --fc-classic-border: var(--color-base-300);
    --fc-classic-strong-border: color-mix(in oklab, var(--color-base-content) 30%, transparent);
}
</style>
