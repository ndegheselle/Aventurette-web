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
    type ActivitySheet,
    type SheetProblem,
    type SheetReferences,
} from '@features/admin/activities-authoring/model/activity.import';
import { routesNames } from '@features/admin/activities-authoring/routes';
import { useAuth } from '@features/auth/composables/useAuth';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

/** The import modal's two stages: the JSON sheet, then its optional cover visual. */
export type ImportStage = 'sheet' | 'visual';

/**
 * The import modal: read a sheet, pick its visual, then write it all as a new draft and open the
 * editor on it.
 *
 * The activity, its materials, steps and workshops, the names the catalogue lacked and the visual
 * go up as one save, as the editor's does: all of it lands, or none of it.
 */
export function useActivityImport() {
    const router = useRouter();
    const { currentId } = useAuth();

    const stage = ref<ImportStage>('sheet');
    const fileName = ref('');
    const sheet = ref<ActivitySheet | null>(null);
    const problems = ref<SheetProblem[]>([]);
    const known = ref<SheetReferences>({ tags: [], safetyInstructions: [], tips: [] });
    const { files: visual, update: pickVisual } = useOneFile();

    /** What the sheet will become, and the names in it that match nothing. */
    const preview = computed(() => sheet.value ? activityFromSheet(sheet.value, known.value) : null);

    /** Start over, and read what the sheet's names are matched against. */
    async function start() {
        stage.value = 'sheet';
        fileName.value = '';
        sheet.value = null;
        problems.value = [];
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
    }

    function next() {
        if (sheet.value) stage.value = 'visual';
    }

    function back() {
        stage.value = 'sheet';
    }

    const { isLoading: isImporting, errors, submit: importSheet } = useSubmit(async () => {
        if (!sheet.value || !preview.value) return;

        const activity = { ...preview.value.activity, id: saveApi.newId(), user: currentId() };
        const catalogue = await materials.getAll();
        const draft = draftFromSheet(sheet.value, activity, catalogue, saveApi.newId);
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
        visual,
        isImporting,
        errors,
        start,
        readSheet,
        pickVisual,
        next,
        back,
        importSheet,
    };
}
