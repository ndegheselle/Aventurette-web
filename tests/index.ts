/**
 * The test toolkit, in one import:
 *
 *     import { anActivity, fakeCrud, mountWithRouter } from '@tests';
 *
 * `@tests` is test-only — `npm run lint:arch` fails if anything that ships imports it.
 */
export * from './builders';
export * from './fakes';
export * from './mount';
export { TEST_LOCALE, createTestI18n } from './i18n';
