import type { UsersResponse } from '@/backend/schema.g';
import { plainMapper, type EntityMapper } from '@chapelure/core';
import type { UserData } from '@features/auth/model/user';

/** A user as the backend stores it. */
export type UserPayload = UsersResponse;

export const userMapper: EntityMapper<UserPayload, UserData> = plainMapper<UserPayload>();
