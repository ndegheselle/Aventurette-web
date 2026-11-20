import type { PlanningPick } from '@features/planning/models/planning';
import { routesNames as planningRoutesNames } from '@features/planning/routes';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// Module state: set by the planning, read by the search and the activity's page it leads to,
// cleared once an activity is added or the pick is given up.
const pick = ref<PlanningPick | null>(null);

/** An activity being picked from the search for a plan, while the user browses away from the planning. */
export function usePlanningPick() {
    const router = useRouter();

    function clear() {
        pick.value = null;
    }

    /** Give the pick up and go back to the planning. */
    function cancel() {
        clear();
        router.push({ name: planningRoutesNames.planning });
    }

    return { pick, clear, cancel };
}
