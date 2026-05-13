import { ActivityEnvironment } from "@features/activities/composables/data/activities";
import type { ComposerTranslation } from "vue-i18n";

export function useAgeDisplay(t: ComposerTranslation, ageMin?: number | null, ageMax?: number | null) {
    if (ageMin && ageMax) {
        return t('activities.age.range', { min: ageMin, max: ageMax });
    } else if (ageMin) {
        return t('activities.age.minOnly', { min: ageMin });
    } else if (ageMax) {
        return t('activities.age.maxOnly', { max: ageMax });
    }
    
    return null;
}

export const availablesEnvironments = [
    { label: 'activities.environment.INDOOR', value: ActivityEnvironment.INDOOR },
    { label: 'activities.environment.OUTDOOR', value: ActivityEnvironment.OUTDOOR },
    { label: 'activities.environment.CLASSROOM', value: ActivityEnvironment.CLASSROOM },
    { label: 'activities.environment.CAR', value: ActivityEnvironment.CAR },
];