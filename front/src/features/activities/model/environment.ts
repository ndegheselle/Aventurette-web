import { ActivityEnvironment } from "@features/activities/model/activity";

/**
 * The environments offered in filters and the edit form, in display order.
 * `label` is a translation key — this is domain data, not translations, which is why it
 * no longer lives under locales/.
 */
export const availablesEnvironments = [
    { label: 'activities.environment.INDOOR', value: ActivityEnvironment.INDOOR },
    { label: 'activities.environment.OUTDOOR', value: ActivityEnvironment.OUTDOOR },
    { label: 'activities.environment.CLASSROOM', value: ActivityEnvironment.CLASSROOM },
    { label: 'activities.environment.CAR', value: ActivityEnvironment.CAR },
];
