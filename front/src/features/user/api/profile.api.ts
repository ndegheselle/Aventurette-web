import { crud } from '@/backend';
import { Collections } from '@/backend/schema.g';
import { userMapper } from '@features/user/api/profile.mapper';

// A user may only write their own record, and never its role: the backend refuses both.
export const profileApi = crud(Collections.Users, userMapper);
