import { referentialsApi, type ReferentialField } from '@features/activities/api/referentials.api';
import type { ReferentialData } from '@features/activities/model/referential';
import { onMounted, ref } from 'vue';

/** A row of every referential, keyed by the activity field that points at it. */
export type Referentials = Record<ReferentialField, ReferentialData[]>;

/**
 * The nine referentials, as any screen that shows or filters an activity needs them.
 *
 * Nine requests the first time and none after — they are `cachedCrud`. `rows` is replaced once,
 * when the lot has arrived, so a caller watching it is not woken nine times for one paint.
 */
export function useReferentials() {
    const rows = ref<Referentials>(empty());

    onMounted(async () => {
        const fields = Object.keys(referentialsApi) as ReferentialField[];
        const loaded = await Promise.all(fields.map(field => referentialsApi[field].getAll()));

        rows.value = Object.fromEntries(
            fields.map((field, index) => [field, loaded[index] ?? []]),
        ) as Referentials;
    });

    return { rows };
}

/** Every referential empty, so a screen renders before the first request answers. */
function empty(): Referentials {
    const rows = {} as Referentials;
    for (const field of Object.keys(referentialsApi) as ReferentialField[])
        rows[field] = [];

    return rows;
}
