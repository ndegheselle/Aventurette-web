import { useAlert } from '@chapelure/ui/alerts/useAlert';
import type { ActivityData } from '@features/activities/models/activity';
import { planningApi } from '@features/planning/api/planning.api';
import { usePlanningPick } from '@features/planning/composables/usePlanningPick';
import { planningWriteOf } from '@features/planning/models/planning';
import { routesNames as planningRoutesNames } from '@features/planning/routes';
import { useAuth } from '@features/user/composables/useAuth';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

/**
 * Adding one activity to the planning: for what the planning picked it for, or else at the next
 * full hour. Then the planning opens on the plan, where its time can be changed.
 */
export function usePlanActivity() {
    const userId = useAuth().currentId();
    const alert = useAlert();
    const { t } = useI18n();
    const router = useRouter();
    const { pick, clear } = usePlanningPick();

    async function plan(activity: ActivityData) {
        const write = planningWriteOf(pick.value, userId, activity, new Date());
        let id: string;
        try {
            if (write.kind === 'change') {
                await planningApi.update(write.id, { activity: write.activity });
                id = write.id;
            } else {
                id = (await planningApi.create(write.plan)).id;
            }
        } catch {
            alert.error(t('validation.errors.default'));
            return;
        }

        clear();
        alert.success(t(write.kind === 'change' ? 'planning.changed' : 'planning.added'));
        router.push({ name: planningRoutesNames.planning, query: { plan: id } });
    }

    return { picking: computed(() => pick.value !== null), plan };
}
