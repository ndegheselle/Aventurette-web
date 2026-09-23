import { cachedCrud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import {
    referentialMapper,
    securityTagMapper,
} from "@features/activities/api/referential.mapper";

/**
 * The nine referentials, keyed by the field on `activities` that points at each. A screen wants
 * them together — a filter bar offers all nine at once — so they are read as a map rather than
 * imported one by one.
 *
 * `cachedCrud`: a referential changes when someone edits the seed, not while a screen is open,
 * so several components asking at once still fetch once.
 */
export const referentialsApi = {
    fields: cachedCrud(Collections.ActivitiesFields, referentialMapper),
    imaginary: cachedCrud(Collections.ActivitiesImaginary, referentialMapper),
    security: cachedCrud(Collections.ActivitiesSecurity, securityTagMapper),
    develop_physical: cachedCrud(Collections.ActivitiesDevelopPhysical, referentialMapper),
    develop_intellectual: cachedCrud(Collections.ActivitiesDevelopIntellectual, referentialMapper),
    develop_affect: cachedCrud(Collections.ActivitiesDevelopAffect, referentialMapper),
    develop_social: cachedCrud(Collections.ActivitiesDevelopSocial, referentialMapper),
    develop_moral: cachedCrud(Collections.ActivitiesDevelopMoral, referentialMapper),
    develop_spritual: cachedCrud(Collections.ActivitiesDevelopSpiritual, referentialMapper),
} as const;

/** The activity field each referential is reached through — and the criterion key that names it. */
export type ReferentialField = keyof typeof referentialsApi;
