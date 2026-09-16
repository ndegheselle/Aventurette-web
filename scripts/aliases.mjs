/**
 * The one alias map, imported by Vite and Vitest. Workspace packages resolve to source, so there
 * is no per-package build step.
 *
 * `front/tsconfig.json` repeats the same list — TypeScript will not read a JS module for its
 * `paths` — and `npm run lint:arch` fails if the two disagree.
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
