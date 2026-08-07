// @chapelure/pocketbase — the PocketBase adapter for the @chapelure/core ports.
//
// This is the only package that may import the pocketbase SDK. The consuming app should
// import it from exactly one place (its composition root) and pass the resulting ports
// around, so swapping backends means rewriting that file and this package.

export { getPocketBase, initPocketBase } from './client';
export { createPocketBaseAuth } from './auth';
export { createPocketBaseCached } from './cached';
export type { ICachedCrud } from './cached';
export { createPocketBaseCrud } from './crud';
export { mapErrors, toValidationError } from './errors';
export { createPocketBaseFileUrls } from './files';
export { filterGroupToPocketBase, filterToPocketBase } from './filters';
