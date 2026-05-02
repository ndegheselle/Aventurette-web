import type { ComposerTranslation } from "vue-i18n";

export function useAgeDisplay(t: ComposerTranslation, ageMin?: number, ageMax?: number) {
    console.log('useAgeDisplay called with:', { ageMin, ageMax });
    if (ageMin && ageMax) {
        return t('activities.age.range', { min: ageMin, max: ageMax });
    } else if (ageMin) {
        return t('activities.age.minOnly', { min: ageMin });
    } else if (ageMax) {
        return t('activities.age.maxOnly', { max: ageMax });
    }
    
    return null;
}