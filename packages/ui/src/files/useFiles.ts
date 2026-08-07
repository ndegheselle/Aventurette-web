import { useAlert } from '@chapelure/ui/composables/useAlert';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * Usage with FilesInput + FilesList:
 *   const { files, update } = useOneFile();
 * 
 *   <FilesInput @change="update" />   — feeds validated File[] into the composable
 *   <FilesList :files />               — renders the resulting files array; supports inline removal
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
 * Usage with FilesInput + FilesList:
 *   const { files, update } = useMultipleFiles(5);
 *
 *   <FilesInput @change="update" />   — feeds validated File[] into the composable
 *   <FilesList :files />               — renders the resulting files array; supports inline removal
 * @param maxFilesNumber max number of files accepted
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