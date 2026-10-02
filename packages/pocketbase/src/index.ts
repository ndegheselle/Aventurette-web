// @chapelure/pocketbase — the PocketBase adapter. The only package that may import the SDK,
// and the app imports it from one file only: front/src/backend/index.ts.

export { createPocketBaseAuth } from './auth';
export { createPocketBaseBatch, pocketBaseId } from './batch';
export { initPocketBase } from './client';
export { createPocketBaseCrud } from './crud';

