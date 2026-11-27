import { send } from "@/backend";
import type { ImportReport } from "@features/activities-authoring/models/import";

/** The backend route that checks a zip and imports it. */
const IMPORT_ROUTE = '/api/activities/import';

export const importApi = {
    /**
     * Send a zip to be checked, and imported when nothing in it is an error — all of it, or
     * nothing. Only an admin may: anyone else is refused before the zip is read.
     */
    run(zip: File): Promise<ImportReport> {
        const body = new FormData();
        body.append('zip', zip);
        return send<ImportReport>(IMPORT_ROUTE, { method: 'POST', body });
    },
};
