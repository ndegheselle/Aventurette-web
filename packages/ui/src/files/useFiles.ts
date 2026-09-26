import { ref } from 'vue';

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

export function formatBytes(bytes: number, decimals: number = 2): string {
    const d = Math.max(0, decimals);

    if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(d)} KB`;
    else if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(d)} MB`;
    return `${(bytes / 1_073_741_824).toFixed(d)} GB`;
}
