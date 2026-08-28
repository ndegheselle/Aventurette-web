import { fileUrls } from '@/backend';
import type { ActivityResourceData } from '@features/activities/model/activity';

/**
 * Public URL of a resource's uploaded file.
 * Keeps components off the backend wiring — they only ever receive a string.
 */
export function activityResourceUrl(resource: ActivityResourceData): string {
    return fileUrls.getUrl(resource, resource.file);
}
