import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { importApi } from '@features/activities-authoring/api/import.api';
import type { ImportReport } from '@features/activities-authoring/models/import';
import { computed, ref, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * The import screen: the author picks a zip and imports it. The backend checks it and writes it
 * only when nothing in it is an error; either way, the screen shows its report.
 */
export function useActivitiesImport() {
    const alert = useAlert();
    const { t } = useI18n();

    const file = shallowRef<File | null>(null);
    const isImporting = ref(false);
    const report = shallowRef<ImportReport | null>(null);

    const isDone = computed(() => !!report.value?.imported);
    const canImport = computed(() => !!file.value && !isImporting.value && !isDone.value);

    function pick(picked: File) {
        file.value = picked;
        report.value = null;
    }

    async function run() {
        if (!file.value || !canImport.value) return;
        isImporting.value = true;

        try {
            report.value = await importApi.run(file.value);
            if (report.value.imported) alert.success(t('activities.authoring.import.done', report.value.fiches.length));
        } catch (error) {
            alert.error(t('activities.authoring.import.failed', { message: error instanceof Error ? error.message : String(error) }));
        } finally {
            isImporting.value = false;
        }
    }

    return { file, isImporting, report, isDone, canImport, pick, run };
}
