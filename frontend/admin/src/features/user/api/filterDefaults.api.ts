import { crud } from '@/backend';
import { Collections } from '@/backend/schema.g';
import { filterDefaultsMapper } from '@features/user/api/filterDefaults.mapper';
import type { FilterDefaultsData } from '@features/user/models/user';

// The filter defaults are fields of the user record. The `users` rules keep it to its owner.
const users = crud(Collections.Users, filterDefaultsMapper);

export const filterDefaultsApi = {
    of: (userId: string) => users.getById(userId),
    save: (userId: string, defaults: Partial<FilterDefaultsData>) => users.update(userId, defaults),
};
