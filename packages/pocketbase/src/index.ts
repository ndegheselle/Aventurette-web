// @chapelure/pocketbase — the PocketBase adapter. The only package that may import the SDK,
// and the app imports it from one file only: front/src/backend/index.ts.

export { getPocketBase, initPocketBase } from './client';
export { createPocketBaseAuth } from './auth';
export { createPocketBaseCached } from './cached';
export type { ICachedCrud } from './cached';
export { createPocketBaseCrud } from './crud';
export { mapErrors, toValidationError } from './errors';
export { createPocketBaseFileUrls } from './files';
export { filterGroupToPocketBase, filterToPocketBase } from './filters';
