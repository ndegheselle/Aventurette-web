import { ref } from 'vue';

/**
 * One picked file, replaced on each pick.
 *
 *     const { files, update } = useOneFile();
 *     <FilesInput @change="update" />
 *     <FilesList v-model:files="files" />
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

/**
 * Whether `file` is one an `<input accept>` would offer: `accept` is its comma-separated list of
 * extensions (`.pdf`), wildcard types (`image/*`) and exact types (`application/pdf`).
 */
export function matchesAccept(file: File, accept: string): boolean {
    const tokens = accept.split(',').map(token => token.trim());
    return tokens.some(token => {
        if (token.startsWith('.')) return file.name.toLowerCase().endsWith(token.toLowerCase());
        if (token.endsWith('/*')) return file.type.startsWith(token.slice(0, -1));
        return file.type === token;
    });
}
