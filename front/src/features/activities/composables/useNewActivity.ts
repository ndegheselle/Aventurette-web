import { useSubmit } from '@chapelure/ui/composables/useSubmit';
import { activitiesApi as activities } from '@features/activities/api/activities.api';
import { createEmptyActivity } from '@features/activities/model/activity';
import { routesNames } from '@features/activities/routes';
import { useAuth } from '@features/auth/composables/useAuth';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

/**
 * Starting a new activity.
 *
 * The record is written before the editor opens, empty but for what the collection requires,
 * and everything after that is an update. That is what lets a step and the files under it be
 * saved the moment they are added: each of them is a record of its own, and a record needs a
 * parent that already exists to belong to.
 */
export function useNewActivity() {
    const router = useRouter();
    const { t } = useI18n();
    const { currentId } = useAuth();

    const { isLoading, errors, submit } = useSubmit(async () => {
        const created = await activities.create({
            ...createEmptyActivity(),
            name: t('activities.untitled'),
            user: currentId(),
        });

        router.push({ name: routesNames.edit, params: { id: created.id } });
    });

    return { isLoading, errors, start: submit };
}
