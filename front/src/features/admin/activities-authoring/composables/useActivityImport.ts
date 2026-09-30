import { useOneFile } from '@chapelure/ui/files/useFiles';
import { useSubmit } from '@chapelure/ui/forms/useSubmit';
import { activitiesApi as activities } from '@features/activities/api/activities.api';
import type { ActivityData } from '@features/activities/model/activity';
import type { ActivityMaterialData } from '@features/activities/model/material';
import type { ActivityStepData } from '@features/activities/model/step';
import type { ActivityTagData } from '@features/activities/model/tag';
import type { ActivityWorkshopData } from '@features/activities/model/workshop';
import {
    activityMaterialsApi as activityMaterials,
    materialsApi as materials,
} from '@features/admin/activities-authoring/api/materials.api';
import { stepsApi as steps } from '@features/admin/activities-authoring/api/steps.api';
import { tagsApi as tags } from '@features/admin/activities-authoring/api/tags.api';
import { visualsApi as visuals } from '@features/admin/activities-authoring/api/visuals.api';
import { workshopsApi as workshops } from '@features/admin/activities-authoring/api/workshops.api';
import {
    activityFromSheet,
    materialsOfSheet,
    readActivitySheet,
    stepFromSheet,
    workshopFromSheet,
    type ActivitySheet,
    type SheetProblem,
} from '@features/admin/activities-authoring/model/activity.import';
import { materialNamed } from '@features/admin/activities-authoring/model/material.edit';
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
 * An activity is several records, written one after the other. Either all of them land or none
 * do: a failure part way deletes the activity, and the cascades take what was already written
 * under it.
 */
export function useActivityImport() {
    const router = useRouter();
    const { currentId } = useAuth();

    const stage = ref<ImportStage>('sheet');
    const fileName = ref('');
    const sheet = ref<ActivitySheet | null>(null);
    const problems = ref<SheetProblem[]>([]);
    const known = ref<ActivityTagData[]>([]);
    const { files: visual, update: pickVisual } = useOneFile();

    /** What the sheet will become, and the tags it names that do not exist. */
    const preview = computed(() => sheet.value ? activityFromSheet(sheet.value, known.value) : null);

    /** Start over, and read the tags the sheet's names are matched against. */
    async function start() {
        stage.value = 'sheet';
        fileName.value = '';
        sheet.value = null;
        problems.value = [];
        visual.value = [];
        known.value = await tags.getAll();
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

        const created = await write(sheet.value, preview.value.activity, visual.value[0]);
        router.push({ name: routesNames.page, params: { id: created.id } });
    });

    /**
     * The activity first, since everything else points at it; then its materials — each taken
     * from the catalogue by name, added to it when missing, and linked with its quantity — which
     * steps and workshops recall by name; then those; then the lists, which is the one write that
     * makes them the activity's. One at a time, so nothing is still in flight when a failure
     * rolls back.
     */
    async function write(from: ActivitySheet, activity: ActivityData, cover: File | undefined): Promise<ActivityData> {
        const created = await activities.create({ ...activity, user: currentId() });

        try {
            const catalogue = await materials.getAll();
            const writtenMaterials: ActivityMaterialData[] = [];
            for (const material of materialsOfSheet(from)) {
                let known = materialNamed(catalogue, material.name);
                if (!known) {
                    known = await materials.create(material.name);
                    catalogue.push(known);
                }
                writtenMaterials.push(await activityMaterials.link(created.id, known, material.quantity));
            }

            const writtenSteps: ActivityStepData[] = [];
            for (const step of from.steps)
                writtenSteps.push(await steps.create(stepFromSheet(step, created.id, writtenMaterials)));

            const writtenWorkshops: ActivityWorkshopData[] = [];
            for (const workshop of from.workshops)
                writtenWorkshops.push(await workshops.create(workshopFromSheet(workshop, created.id, writtenMaterials)));

            await activities.update(created.id, {
                materials: writtenMaterials,
                steps: writtenSteps,
                workshops: writtenWorkshops,
            });

            if (cover)
                await visuals.upload(created.id, cover);

            return created;
        } catch (error) {
            // The steps, workshops and material links cascade with it; a name the import added to
            // the catalogue stays there. Should this fail too, what the author sees is the first
            // error, which is the one that explains the rest.
            await activities.remove(created.id).catch(() => undefined);
            throw error;
        }
    }

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
