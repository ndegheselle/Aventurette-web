// @chapelure/pocketbase — the PocketBase adapter. The only package that may import the SDK,
// and the app imports it from one file only: front/src/backend/index.ts.

export { initPocketBase } from './client';
export { createPocketBaseAuth } from './auth';
export { createPocketBaseCrud } from './crud';
