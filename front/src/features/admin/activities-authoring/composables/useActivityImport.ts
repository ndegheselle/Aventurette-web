import { useOneFile } from '@chapelure/ui/files/useFiles';
import { useSubmit } from '@chapelure/ui/forms/useSubmit';
import { materialsApi as materials } from '@features/admin/activities-authoring/api/materials.api';
import { safetyInstructionsApi } from '@features/admin/activities-authoring/api/safety.api';
import { saveApi } from '@features/admin/activities-authoring/api/save.api';
import { tagsApi as tags } from '@features/admin/activities-authoring/api/tags.api';
import { tipsApi } from '@features/admin/activities-authoring/api/tips.api';
import { activityWrites } from '@features/admin/activities-authoring/model/activity.edit';
import {
    activityFromSheet,
    draftFromSheet,
    readActivitySheet,
    referenceCandidates,
    unsetFields,
    type ActivitySheet,
    type ReferenceKind,
    type ReferencePicks,
    type SheetProblem,
    type SheetReferences,
    type SheetStepFiles,
} from '@features/admin/activities-authoring/model/activity.import';
import { routesNames } from '@features/admin/activities-authoring/routes';
import { useAuth } from '@features/auth/composables/useAuth';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

/**
 * The import modal's stages, in order: the JSON sheet; what it lacks — links for the names that
 * matched nothing, and a recap of the empty fields; then the files a sheet cannot carry.
 */
export const IMPORT_STAGES = ['sheet', 'complete', 'files'] as const;
export type ImportStage = typeof IMPORT_STAGES[number];

/**
 * The import modal: read a sheet, complete it, pick its files, then write it all as a new draft
 * and open the editor on it.
 *
 * The activity, its materials, steps and workshops, the names the catalogue lacked, the step files
 * and the visual go up as one save, as the editor's does: all of it lands, or none of it.
 */
export function useActivityImport() {
    const router = useRouter();
    const { currentId } = useAuth();

    const stage = ref<ImportStage>('sheet');
    const fileName = ref('');
    const sheet = ref<ActivitySheet | null>(null);
    const problems = ref<SheetProblem[]>([]);
    const known = ref<SheetReferences>({ tags: [], safetyInstructions: [], tips: [] });
    const picks = ref<ReferencePicks>({});
    const stepFiles = ref<SheetStepFiles[]>([]);
    const { files: visual, update: pickVisual } = useOneFile();

    /** What the sheet will become, and the names in it that match nothing. */
    const preview = computed(() => sheet.value ? activityFromSheet(sheet.value, known.value, picks.value) : null);

    /** What the draft will still lack, for the author to fill in the editor. */
    const unset = computed(() => sheet.value && preview.value ? unsetFields(preview.value.activity, sheet.value.steps) : []);

    /** What a name that matched nothing may be linked to instead. */
    function candidates(kind: ReferenceKind) {
        return referenceCandidates(known.value, kind);
    }

    /** Start over, and read what the sheet's names are matched against. */
    async function start() {
        stage.value = 'sheet';
        fileName.value = '';
        sheet.value = null;
        problems.value = [];
        picks.value = {};
        stepFiles.value = [];
        visual.value = [];
        const [knownTags, safetyInstructions, tips] = await Promise.all([
            tags.getAll(),
            safetyInstructionsApi.getAll(),
            tipsApi.getAll(),
        ]);
        known.value = { tags: knownTags, safetyInstructions, tips };
    }

    async function readSheet(files: File[]) {
        const [file] = files;
        if (!file) return;

        const reading = readActivitySheet(await file.text());
        fileName.value = file.name;
        sheet.value = reading.sheet;
        problems.value = reading.problems;
        picks.value = {};
        stepFiles.value = (reading.sheet?.steps ?? []).map(() => ({ id: saveApi.newId(), resources: [] }));
    }

    function next() {
        const index = IMPORT_STAGES.indexOf(stage.value);
        if (sheet.value && index < IMPORT_STAGES.length - 1) stage.value = IMPORT_STAGES[index + 1]!;
    }

    function back() {
        const index = IMPORT_STAGES.indexOf(stage.value);
        if (index > 0) stage.value = IMPORT_STAGES[index - 1]!;
    }

    const { isLoading: isImporting, errors, submit: importSheet } = useSubmit(async () => {
        if (!sheet.value || !preview.value) return;

        const activity = { ...preview.value.activity, id: saveApi.newId(), user: currentId() };
        const catalogue = await materials.getAll();
        const draft = draftFromSheet(sheet.value, activity, catalogue, saveApi.newId, stepFiles.value);
        const writes = activityWrites(null, draft.activity, draft.newMaterials, visual.value[0]);
        await saveApi.send(writes);

        router.push({ name: routesNames.page, params: { id: activity.id } });
    });

    return {
        stage,
        fileName,
        sheet,
        problems,
        preview,
        picks,
        unset,
        stepFiles,
        visual,
        isImporting,
        errors,
        start,
        readSheet,
        candidates,
        pickVisual,
        next,
        back,
        importSheet,
    };
}
