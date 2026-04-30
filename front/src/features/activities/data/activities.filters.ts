import { type FilterDefinition, type FilterGroup, BindingKind, createFilter, createGroup, FilterType } from "@chapelure/api/filters";
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
        type: FilterType.Number,
        label: 'activities.fields.age',
        binding: { kind: BindingKind.Range, keyMin: 'ageMin', keyMax: 'ageMax' },
    },
    {
        type: FilterType.Number,
        label: 'activities.fields.durationMinutes',
        binding: { kind: BindingKind.Single, key: 'durationMinutes' },
    },
    {
        type: FilterType.Choice,
        label: 'activities.fields.environnement',
        binding: { kind: BindingKind.Single, key: 'environnement' },
        availables: [
            { label: 'activities.environnement.INDOOR', value: 'INDOOR' },
            { label: 'activities.environnement.OUTDOOR', value: 'OUTDOOR' },
            { label: 'activities.environnement.CLASSROOM', value: 'CLASSROOM' },
            { label: 'activities.environnement.CAR', value: 'CAR' },
        ],
    },
];