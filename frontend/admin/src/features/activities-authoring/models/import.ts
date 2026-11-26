/**
 * What the backend's import answers: the zip checked fiche by fiche, and whether it was written.
 * The check and the import are the server's (ADR 0026); the screen only shows the report.
 * See `docs/user/import` for the zip itself.
 */

/**
 * Something the check found. An error stops the import; a warning is shown and does not. `code`
 * picks the message in the locales; `path` says where in the file, as `steps[2].materials`.
 */
export interface ImportProblem {
    level: 'error' | 'warning';
    code: string;
    path?: string;
    /** What the message quotes: an identifier, a name, a file. */
    value?: string;
    /** A translation key the message quotes, such as the kind of a reference. */
    label?: string;
}

export interface ImportReport {
    /** False whenever a problem is an error: then nothing was written. */
    imported: boolean;
    /** What is wrong with the zip as a whole. */
    problems: ImportProblem[];
    /** Null when the zip has no glossary.json. */
    glossary: { created: number; updated: number; problems: ImportProblem[] } | null;
    fiches: FicheReport[];
}

export interface FicheReport {
    /** The fiche's folder, which is its Confluence page id. */
    folder: string;
    /** Its title, empty when it could not be read. */
    name: string;
    readable: boolean;
    /** Whether it updates the activity an earlier import made, rather than creating one. */
    update: boolean;
    problems: ImportProblem[];
}
