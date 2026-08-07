/**
 * A translation lookup. Declared structurally rather than importing vue-i18n's
 * ComposerTranslation, so the model layer stays free of framework types.
 */
export type Translate = (key: string, params?: Record<string, unknown>) => string;

/**
 * Render an age range, tolerating either bound being missing.
 * Renamed from useAgeDisplay: it is a plain formatter, not a composable.
 */
export function formatAgeRange(t: Translate, ageMin?: number | null, ageMax?: number | null): string | null {
    if (ageMin && ageMax) {
        return t('activities.age.range', { min: ageMin, max: ageMax });
    } else if (ageMin) {
        return t('activities.age.minOnly', { min: ageMin });
    } else if (ageMax) {
        return t('activities.age.maxOnly', { max: ageMax });
    }

    return null;
}
