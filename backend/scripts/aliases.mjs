/**
 * The one alias map, imported by Vite and Vitest. Workspace packages resolve to source, so there
 * is no per-package build step.
 *
 * `web/tsconfig.json` repeats the same list — TypeScript will not read a JS module for its
 * `paths` — and `npm run lint:arch` fails if the two disagree.
 */
import { fileURLToPath, URL } from 'node:url';

const fromFrontend = (path) => fileURLToPath(new URL(`../../frontend/${path}`, import.meta.url));

/** alias -> absolute path. Keep in sync with the `paths` in web/tsconfig.json. */
export const aliases = {
    '@chapelure/core': fromFrontend('packages/core/src'),
    '@chapelure/pocketbase': fromFrontend('packages/pocketbase/src'),
    '@chapelure/ui': fromFrontend('packages/ui/src'),
    '@features': fromFrontend('web/src/features'),
    '@': fromFrontend('web/src'),
    // Test-only. `lint:arch` fails if anything that ships imports through it.
    '@tests': fromFrontend('tests'),
};
