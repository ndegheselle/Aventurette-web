<!-- The user's planning: a calendar of the activities they planned. Tapping a plan opens a sheet on
     it; tapping a time, or the plus button, opens one on a new plan, drawn where it will land.
     Tapping a day of the month opens that day. -->
<script setup lang="ts">
import Dropdown from '@chapelure/ui/dropdown/Dropdown.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import { useIsMobile } from '@chapelure/ui/layout/useIsMobile';
import ResponsiveModal from '@chapelure/ui/modals/ResponsiveModal.vue';
import { routesNames as activitiesRoutesNames } from '@features/activities/routes';
import { usePlanning } from '@features/planning/composables/usePlanning';
import { PLANNING_VIEWS } from '@features/planning/models/planning';
import FullCalendar, { type CalendarOptions } from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/vue3/daygrid';
import interactionPlugin from '@fullcalendar/vue3/interaction';
import listPlugin from '@fullcalendar/vue3/list';
import frLocale from '@fullcalendar/vue3/locales/fr';
import '@fullcalendar/vue3/skeleton.css';
import classicThemePlugin from '@fullcalendar/vue3/themes/classic';
import '@fullcalendar/vue3/themes/classic/theme.css';
import timeGridPlugin from '@fullcalendar/vue3/timegrid';
import {
    ArrowLeftRightIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EyeIcon,
    PlusIcon,
    SearchIcon,
    Trash2Icon,
} from 'lucide-vue-next';
import { computed, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

const calendar = useTemplateRef<InstanceType<typeof FullCalendar>>('calendar');
const {
    fetchEvents, title, view, onDatesSet, prev, next, today, changeView, onDateClick,
    sheet, selected, start, isNew, canPick, addNew, select, moveSelected, pickActivity, removeSelected,
} = usePlanning(calendar);
const { locale } = useI18n();
const { isMobile } = useIsMobile();

// A month grid is cramped on a phone: there, the week as a list to start with. Read once: an
// option that changes is applied again, and would put the calendar back on its first view.
const initialView = isMobile.value ? 'listWeek' : 'dayGridMonth';

// The toolbar is the screen's own, above the calendar, rather than the calendar's.
const options = computed<CalendarOptions>(() => ({
    plugins: [classicThemePlugin, dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    locales: [frLocale],
    locale: locale.value,
    initialView,
    headerToolbar: false,
    height: 'auto',
    events: fetchEvents,
    eventClick: ({ event }) => select(event.id),
    dateClick: onDateClick,
    datesSet: onDatesSet,
}));
</script>

<template>
    <Container>
        <!-- On a phone, room under the calendar for the actions floating above the dock. -->
        <div class="planning p-2 max-md:pb-20">
            <div class="flex items-center gap-1 mb-2">
                <h2 class="flex-1 min-w-0 truncate text-lg md:text-xl font-semibold first-letter:uppercase">
                    {{ title }}
                </h2>
                <div class="join">
                    <button type="button" class="btn btn-sm btn-ghost btn-square join-item"
                            :aria-label="$t('planning.calendar.prev')" @click="prev">
                        <ChevronLeftIcon />
                    </button>
                    <button type="button" class="btn btn-sm btn-ghost btn-square join-item"
                            :aria-label="$t('planning.calendar.next')" @click="next">
                        <ChevronRightIcon />
                    </button>
                </div>
                <button type="button" class="btn btn-sm btn-soft" @click="today">
                    {{ $t('planning.calendar.today') }}
                </button>
                <Dropdown class="dropdown-end">
                    <template #summary>
                        <summary class="btn btn-sm btn-soft">
                            {{ $t(`planning.calendar.views.${view || 'dayGridMonth'}`) }}
                            <ChevronDownIcon class="icon-sm opacity-50" />
                        </summary>
                    </template>
                    <ul class="menu p-2 w-36">
                        <li v-for="to in PLANNING_VIEWS" :key="to">
                            <a :class="{ 'menu-active': to === view }" @click="changeView(to)">
                                {{ $t(`planning.calendar.views.${to}`) }}
                            </a>
                        </li>
                    </ul>
                </Dropdown>
                <button v-if="!isMobile" type="button" class="btn btn-sm btn-square btn-primary"
                        :aria-label="$t('planning.actions.add')" @click="addNew">
                    <PlusIcon />
                </button>
            </div>
            <FullCalendar ref="calendar" :options="options" />
        </div>

        <!-- The actions, as on an activity's page: floating above the dock on a phone. -->
        <div v-if="isMobile" class="fixed inset-x-0 bottom-14 z-10 flex justify-center p-2 pointer-events-none">
            <button type="button" class="btn btn-square btn-lg btn-primary pointer-events-auto"
                    :aria-label="$t('planning.actions.add')" @click="addNew">
                <PlusIcon />
            </button>
        </div>

        <ResponsiveModal :controller="sheet">
            <template #title>
                {{ isNew ? $t('planning.sheet.newTitle') : selected?.activity?.name }}
            </template>
            <div class="flex flex-col gap-4">
                <label class="flex flex-col gap-1">
                    <span>{{ $t('planning.sheet.when') }}</span>
                    <input v-model="start" type="datetime-local" class="input w-full" @change="moveSelected" />
                </label>

                <button v-if="isNew" type="button" class="btn btn-primary" :disabled="!canPick" @click="pickActivity">
                    <SearchIcon />
                    {{ $t('planning.actions.pick') }}
                </button>

                <div v-else-if="selected" class="grid grid-cols-3 gap-2">
                    <RouterLink v-if="selected.activity" class="btn btn-primary"
                                :to="{ name: activitiesRoutesNames.activity, params: { id: selected.activity.id } }">
                        <EyeIcon />
                        {{ $t('planning.actions.open') }}
                    </RouterLink>
                    <button type="button" class="btn" :disabled="!canPick" @click="pickActivity">
                        <ArrowLeftRightIcon />
                        {{ $t('planning.actions.change') }}
                    </button>
                    <button type="button" class="btn btn-error btn-soft" @click="removeSelected">
                        <Trash2Icon />
                        {{ $t('planning.actions.remove') }}
                    </button>
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

/* A new plan, before its activity is picked: drawn faint and dashed, where it will land. */
.planning :deep(.planning-preview) {
    opacity: 0.7;
    outline: 2px dashed var(--color-primary-content);
    outline-offset: -2px;
}

/* A day of the month opens on a tap; a time of the week or the day plans there. */
.planning :deep(.fc-daygrid-day),
.planning :deep(.fc-timegrid-slot) {
    cursor: pointer;
}
</style>
