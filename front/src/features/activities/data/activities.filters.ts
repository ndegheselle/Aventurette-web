import { type FilterDefinition, type FilterGroup, createGroup, createFilter, FilterType } from "@chapelure/api/filters";
import type { ActivityData } from "@features/activities/data/activities";

export function createSearchFilter(search: string): FilterGroup {
    return createGroup({
        filters: [
            createFilter({
                key: 'name',
                value: search,
            }),
            createFilter({
                key: 'summary',
                value: search,
            }),
            createFilter({
                key: 'description',
                value: search,
            }),
        ]
    });
}

export const definition: FilterDefinition<ActivityData>[] = [
    {
        type: FilterType.Range,
        label: 'activities.fields.age',
        binding: { kind: 'range', keyMin: 'ageMin', keyMax: 'ageMax' },
    },
    {
        type: FilterType.Number,
        label: 'activities.fields.duration',
        binding: { kind: 'single', key: 'durationMinutes' },
    },
    {
        type: FilterType.Choices,
        label: 'activities.fields.environnement',
        binding: { kind: 'single', key: 'environnement' },
        availables: [
            { label: 'activities.environnement.INDOOR', value: 'INDOOR' },
            { label: 'activities.environnement.OUTDOOR', value: 'OUTDOOR' },
            { label: 'activities.environnement.CLASSROOM', value: 'CLASSROOM' },
            { label: 'activities.environnement.CAR', value: 'CAR' },
        ],
    },
];