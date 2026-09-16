import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * One picked file, replaced on each pick.
 *
 *     const { files, update } = useOneFile();
 *     <FilesInput @change="update" />
 *     <FilesList :files />
 */
export function useOneFile() {
    const files = ref<File[]>([]);

    function update(newFiles: File[]) {
        files.value = newFiles.slice(0, 1);
    }

    return {
        files,
        update
    }
}

/**
 * Picked files, appended on each pick. Over the limit, what fits is kept and the user alerted.
 *
 *     const { files, update } = useMultipleFiles(5);
 *     <FilesInput multiple @change="update" />
 *     <FilesList :files />
 */
export function useMultipleFiles(maxFilesNumber: number = 10) {
    const { t } = useI18n();
    const alert = useAlert();

    const files = ref<File[]>([]);

    function update(newFiles: File[]) {
        if (files.value.length + newFiles.length > maxFilesNumber) {
            alert.error(t('inputs.file.upload.exceedNumber', { number: maxFilesNumber }));
            newFiles = newFiles.slice(0, maxFilesNumber - files.value.length);
        }
        
        if (newFiles.length)
            files.value = files.value.concat(newFiles);
    }

    return {
        files,
        update
    }
}