/**
 * The one alias map.
 *
 * Workspace packages resolve to source rather than through node_modules: no per-package build
 * step, `vue-tsc -b` typechecks them with the app, and HMR crosses package boundaries.
 *
 * Vite and Vitest both import this. `front/tsconfig.json` cannot — TypeScript will not read a
 * JS module for its paths — so it repeats the same list, and `npm run lint:arch` fails if the
 * two ever disagree.
 */
import { fileURLToPath, URL } from 'node:url';

const fromRoot = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));

/** alias -> absolute path. Keep in sync with the `paths` in front/tsconfig.json. */
export const aliases = {
    '@chapelure/core': fromRoot('packages/core/src'),
    '@chapelure/pocketbase': fromRoot('packages/pocketbase/src'),
    '@chapelure/ui': fromRoot('packages/ui/src'),
    '@features': fromRoot('front/src/features'),
    '@': fromRoot('front/src'),
    // Test-only. `lint:arch` fails if anything that ships imports through it.
    '@tests': fromRoot('tests'),
};
