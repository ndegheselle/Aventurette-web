<!-- The user's planning: a calendar of the activities they planned. Tapping a plan opens a sheet on
     it; tapping a time, or the plus button, opens one on a new plan, drawn where it will land.
     Tapping a day of the month opens that day. -->
<script setup lang="ts">
import { useIsMobile } from '@chapelure/ui/layout/useIsMobile';
import ResponsiveModal from '@chapelure/ui/modals/ResponsiveModal.vue';
import { Button } from '@chapelure/ui/shadcn/button';
import { ButtonGroup } from '@chapelure/ui/shadcn/button-group';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@chapelure/ui/shadcn/dropdown-menu';
import { Input } from '@chapelure/ui/shadcn/input';
import { Label } from '@chapelure/ui/shadcn/label';
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
    CheckIcon,
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

<!-- A tab of the user's space, which holds the page's container. -->
<template>
    <div class="flex flex-col">
        <!-- On a phone, room under the calendar for the actions floating above the dock. -->
        <div class="planning p-2 max-md:pb-20">
            <div class="flex items-center gap-1 mb-2">
                <h2 class="flex-1 min-w-0 truncate text-lg md:text-xl font-semibold first-letter:uppercase">
                    {{ title }}
                </h2>
                <ButtonGroup>
                    <Button type="button" variant="ghost" size="icon-sm"
                            :aria-label="$t('planning.calendar.prev')" @click="prev">
                        <ChevronLeftIcon />
                    </Button>
                    <Button type="button" variant="ghost" size="icon-sm"
                            :aria-label="$t('planning.calendar.next')" @click="next">
                        <ChevronRightIcon />
                    </Button>
                </ButtonGroup>
                <Button type="button" variant="secondary" size="sm" @click="today">
                    {{ $t('planning.calendar.today') }}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <Button type="button" variant="secondary" size="sm">
                            {{ $t(`planning.calendar.views.${view || 'dayGridMonth'}`) }}
                            <ChevronDownIcon class="opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" class="w-36">
                        <DropdownMenuItem v-for="to in PLANNING_VIEWS" :key="to"
                                          :class="{ 'bg-accent text-accent-foreground': to === view }"
                                          @select="changeView(to)">
                            {{ $t(`planning.calendar.views.${to}`) }}
                            <CheckIcon v-if="to === view" class="ms-auto" />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button v-if="!isMobile" type="button" size="icon-sm"
                        :aria-label="$t('planning.actions.add')" @click="addNew">
                    <PlusIcon />
                </Button>
            </div>
            <FullCalendar ref="calendar" :options="options" />
        </div>

        <!-- The actions, as on an activity's page: floating above the dock on a phone. -->
        <div v-if="isMobile" class="fixed inset-x-0 bottom-14 z-10 flex justify-center p-2 pointer-events-none">
            <Button type="button" size="icon-lg" class="pointer-events-auto rounded-full shadow-md"
                    :aria-label="$t('planning.actions.add')" @click="addNew">
                <PlusIcon />
            </Button>
        </div>

        <ResponsiveModal :controller="sheet">
            <template #title>
                {{ isNew ? $t('planning.sheet.newTitle') : selected?.activity?.name }}
            </template>
            <div class="flex flex-col gap-4">
                <Label class="flex-col items-stretch">
                    <span>{{ $t('planning.sheet.when') }}</span>
                    <Input v-model="start" type="datetime-local" @change="moveSelected" />
                </Label>

                <Button v-if="isNew" type="button" :disabled="!canPick" @click="pickActivity">
                    <SearchIcon />
                    {{ $t('planning.actions.pick') }}
                </Button>

                <div v-else-if="selected" class="grid grid-cols-3 gap-2">
                    <Button v-if="selected.activity" as-child>
                        <RouterLink :to="{ name: activitiesRoutesNames.activity, params: { id: selected.activity.id } }">
                            <EyeIcon />
                            {{ $t('planning.actions.open') }}
                        </RouterLink>
                    </Button>
                    <Button type="button" variant="outline" :disabled="!canPick" @click="pickActivity">
                        <ArrowLeftRightIcon />
                        {{ $t('planning.actions.change') }}
                    </Button>
                    <Button type="button" variant="secondary" class="text-destructive" @click="removeSelected">
                        <Trash2Icon />
                        {{ $t('planning.actions.remove') }}
                    </Button>
                </div>
            </div>
        </ResponsiveModal>
    </div>
</template>

<style scoped>
/* The classic theme's palette, from the shadcn theme instead of its own: the calendar follows a
   theme switch, light or dark, the way the rest of the app does. */
.planning {
    --fc-classic-button: var(--primary);
    --fc-classic-button-border: var(--primary);
    /* Pressed: the button's own colour, pulled toward the background, so its text reads in either theme. */
    --fc-classic-button-strong: color-mix(in oklab, var(--primary) 80%, var(--background));
    --fc-classic-button-strong-border: color-mix(in oklab, var(--primary) 80%, var(--background));
    --fc-classic-button-outline: color-mix(in oklab, var(--ring) 50%, transparent);
    --fc-classic-button-foreground: var(--primary-foreground);

    --fc-classic-primary: var(--primary);
    --fc-classic-primary-foreground: var(--primary-foreground);

    --fc-classic-event: var(--primary);
    --fc-classic-event-contrast: var(--primary-foreground);
    --fc-classic-background-event: var(--muted-foreground);
    --fc-classic-background-event-opacity: 15%;
    --fc-classic-background-event-foreground-opacity: 50%;
    --fc-classic-highlight: color-mix(in oklab, var(--primary) 15%, transparent);
    --fc-classic-today: var(--accent);
    --fc-classic-now: var(--destructive);
    --fc-classic-small-dot-width: 8px;
    --fc-classic-large-dot-width: 10px;

    --fc-classic-background: var(--background);
    --fc-classic-faint: color-mix(in oklab, var(--foreground) 4%, transparent);
    --fc-classic-muted: color-mix(in oklab, var(--foreground) 8%, transparent);
    --fc-classic-strong: color-mix(in oklab, var(--foreground) 14%, transparent);

    --fc-classic-foreground: var(--foreground);
    --fc-classic-faint-foreground: color-mix(in oklab, var(--foreground) 40%, transparent);
    --fc-classic-muted-foreground: var(--muted-foreground);

    --fc-classic-border: var(--border);
    --fc-classic-strong-border: color-mix(in oklab, var(--foreground) 30%, transparent);
}

/* A new plan, before its activity is picked: drawn faint and dashed, where it will land. */
.planning :deep(.planning-preview) {
    opacity: 0.7;
    outline: 2px dashed var(--primary-foreground);
    outline-offset: -2px;
}

/* A day of the month opens on a tap; a time of the week or the day plans there. */
.planning :deep(.fc-daygrid-day),
.planning :deep(.fc-timegrid-slot) {
    cursor: pointer;
}
</style>
