import { useAlert } from '@chapelure/ui/alerts/useAlert';
import type { MaterialData } from '@features/activities/models/material';
import { importApi } from '@features/activities-authoring/api/import.api';
import { materialCatalogueApi } from '@features/activities-authoring/api/materials.api';
import { referencesApi } from '@features/activities-authoring/api/references.api';
import { saveApi } from '@features/activities-authoring/api/save.api';
import { activityWrites } from '@features/activities-authoring/models/activity.edit';
import { draftFromFiche } from '@features/activities-authoring/models/fiche.import';
import { glossaryCounts } from '@features/activities-authoring/models/glossary.import';
import {
    checkImport,
    ficheIdsOf,
    filesOf,
    hasErrors,
    readImport,
    unzipImport,
    type ImportReport,
} from '@features/activities-authoring/models/import';
import { useAuth } from '@features/user/composables/useAuth';
import { computed, ref, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

/** How one fiche's save went: saved, or the message it failed with. */
export type FicheResult = { saved: true } | { saved: false; message: string };

/**
 * The import screen: a zip is checked as soon as it is picked, and nothing is written until the
 * author confirms a check with no error. Then the glossary is written first, as one batch, and
 * each fiche as one batch of its own: a fiche that fails leaves the others saved.
 */
export function useActivitiesImport() {
    const alert = useAlert();
    const { t } = useI18n();
    const { currentId } = useAuth();

    const fileName = ref('');
    const isChecking = ref(false);
    const isImporting = ref(false);
    /** The picked file is not a zip. */
    const unreadable = ref(false);
    const report = shallowRef<ImportReport | null>(null);
    /** Each fiche's outcome once imported, by its folder. */
    const results = ref<Record<string, FicheResult>>({});

    let catalogue: MaterialData[] = [];

    const isDone = computed(() => Object.keys(results.value).length > 0);
    const blocked = computed(() => !!report.value && hasErrors(report.value));
    const canImport = computed(() => !!report.value && !blocked.value && !isImporting.value && !isDone.value);

    async function check(file: File) {
        fileName.value = file.name;
        unreadable.value = false;
        report.value = null;
        results.value = {};
        isChecking.value = true;

        try {
            let reading;
            try {
                reading = readImport(unzipImport(new Uint8Array(await file.arrayBuffer())));
            } catch {
                unreadable.value = true;
                return;
            }

            const [references, materials, existing] = await Promise.all([
                referencesApi.getAll(),
                materialCatalogueApi.getAll(),
                importApi.bySourceIds(ficheIdsOf(reading)),
            ]);
            catalogue = materials;
            report.value = checkImport(reading, { references, catalogue, existing, newId: saveApi.newId });
        } finally {
            isChecking.value = false;
        }
    }

    async function run() {
        const checked = report.value;
        if (!checked || !canImport.value) return;
        isImporting.value = true;

        try {
            const glossary = checked.glossary && glossaryCounts(checked.glossary.plan);
            if (checked.glossary && glossary && glossary.created + glossary.updated) {
                try {
                    await importApi.saveGlossary(checked.glossary.plan);
                } catch (error) {
                    alert.error(t('activities.authoring.import.failed', { message: messageOf(error) }));
                    return;
                }
            }

            const outcome: Record<string, FicheResult> = {};
            for (const { folder, fiche, existing } of checked.fiches) {
                if (!fiche) continue;

                const draft = draftFromFiche(fiche, {
                    references: checked.references,
                    catalogue,
                    files: filesOf(folder),
                    newId: saveApi.newId,
                    author: currentId(),
                    original: existing,
                });

                try {
                    await saveApi.send(activityWrites(existing, draft.activity, draft.newMaterials, draft.visual));
                    // A later fiche naming the same new material links this one.
                    catalogue = [...catalogue, ...draft.newMaterials];
                    outcome[folder.name] = { saved: true };
                } catch (error) {
                    outcome[folder.name] = { saved: false, message: messageOf(error) };
                }
            }
            results.value = outcome;

            const saved = Object.values(outcome).filter(result => result.saved).length;
            if (saved) alert.success(t('activities.authoring.import.done', saved));
        } finally {
            isImporting.value = false;
        }
    }

    return { fileName, isChecking, isImporting, unreadable, report, results, isDone, blocked, canImport, check, run };
}

function messageOf(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
