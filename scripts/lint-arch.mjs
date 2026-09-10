#!/usr/bin/env node
/**
 * Architecture rules, checked by grep.
 *
 * These encode the boundaries the codebase is organised around. They are cheap and
 * approximate on purpose: the point is to catch a boundary being crossed in review, not to
 * be a type system. Run with `npm run lint:arch`.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, posix, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { aliases } from './aliases.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', 'pb_data', 'certbot']);

function walk(dir, out = []) {
    let entries;
    try {
        entries = readdirSync(dir);
    } catch {
        return out;
    }
    for (const entry of entries) {
        if (SKIP_DIRS.has(entry)) continue;
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, out);
        else out.push(full);
    }
    return out;
}

const files = walk(join(ROOT, 'front', 'src'))
    .concat(walk(join(ROOT, 'packages')))
    .concat(walk(join(ROOT, 'tests')))
    .filter(f => /\.(ts|vue|mts|js)$/.test(f))
    .map(f => ({
        path: posix.join(...relative(ROOT, f).split(sep)),
        get text() {
            const value = readFileSync(f, 'utf8');
            Object.defineProperty(this, 'text', { value });
            return value;
        },
    }));

/** A spec, or part of the shared test toolkit. Nothing here is in the shipped bundle. */
function isTestFile(path) {
    return /\.spec\.ts$/.test(path) || path.startsWith('tests/');
}

/** Each rule reports the files that violate it. */
const RULES = [
    {
        name: 'backend adapter is reachable from one file only',
        why: 'Swapping backends must mean rewriting front/src/backend/index.ts, nothing else.',
        check: f => f.path.startsWith('front/src/')
            && f.path !== 'front/src/backend/index.ts'
            && /@chapelure\/pocketbase/.test(f.text),
    },
    {
        name: 'the pocketbase SDK stays inside its adapter',
        why: 'Only packages/pocketbase (and the generated schema) may know the SDK exists.',
        check: f => !f.path.startsWith('packages/pocketbase/')
            && f.path !== 'front/src/backend/schema.g.ts'
            && /from ['"]pocketbase['"]/.test(f.text),
    },
    {
        name: 'backend wiring is consumed through a feature api layer',
        why: "Components must not import @/backend; go through features/<name>/api/.",
        check: f => f.path.startsWith('front/src/')
            && !/^front\/src\/features\/[^/]+\/api\//.test(f.path)
            && f.path !== 'front/src/backend/index.ts'
            && /from ['"]@\/backend['"]/.test(f.text),
    },
    {
        name: '@chapelure/core is framework-free',
        why: 'core must survive a change of UI framework or backend untouched.',
        check: f => f.path.startsWith('packages/core/')
            && /from ['"](vue|vue-i18n|vue-router|pocketbase|@\/|@features\/)/.test(f.text),
    },
    {
        name: 'feature model/ and api/ are framework-free',
        why: 'Domain types and repositories should outlive the view layer.',
        check: f => /^front\/src\/features\/[^/]+\/(model|api)\//.test(f.path)
            && /from ['"](vue|vue-i18n|vue-router|@chapelure\/ui)/.test(f.text),
    },
    {
        name: '@chapelure/ui depends on neither the app nor the backend',
        why: 'The design system has to stay reusable by a second app.',
        check: f => f.path.startsWith('packages/ui/')
            && /from ['"](@\/|@features\/|@chapelure\/pocketbase)/.test(f.text),
    },
    {
        name: 'test helpers stay out of the bundle',
        why: 'Anything reachable from @tests exists only for the suite; shipping it would ' +
            'put builders and in-memory fakes in the app.',
        check: f => !isTestFile(f.path)
            && /from ['"]@tests(\/[^'"]*)?['"]/.test(f.text),
    },
    {
        name: 'the pocketbase test double stays in its specs',
        why: 'packages/pocketbase/src/testing.ts fakes the SDK client for this package\'s own ' +
            'tests. Importing it anywhere else means shipping a fake backend.',
        check: f => !isTestFile(f.path)
            && !/^packages\/pocketbase\/src\/testing\.ts$/.test(f.path)
            && /from ['"][^'"]*\/testing['"]/.test(f.text),
    },
    {
        name: 'feature composables/ go through their own api layer',
        why: 'A composable is Vue, but it is still not where a backend client belongs.',
        check: f => /^front\/src\/features\/[^/]+\/composables\//.test(f.path)
            && /from ['"]@\/backend['"]/.test(f.text),
    },
    // There is deliberately no rule confining daisyUI component classes to packages/ui.
    // It held, but only by breeding one-line wrapper components whose entire body was the
    // class name being hidden. See the compromises section of ARCHITECTURE.md.
];

/**
 * The alias map and the tsconfig paths describe the same thing in two places, because
 * TypeScript cannot read a JS module for its `paths`. This checks they still agree.
 */
function aliasesMatchTsconfig() {
    const raw = readFileSync(join(ROOT, 'front', 'tsconfig.json'), 'utf8');

    // Read the `paths` block directly rather than parsing the file. It is JSONC, and the
    // values contain `/*`, so stripping comments with a regex mangles them.
    const block = raw.slice(raw.indexOf('"paths"'));
    const body = block.slice(block.indexOf('{') + 1, block.indexOf('}'));
    const keys = [...body.matchAll(/"([^"]+)"\s*:\s*\[/g)].map(match => match[1]);

    if (keys.length === 0)
        return ['no paths found in front/tsconfig.json — has the file moved?'];

    const declared = new Set(keys.map(key => key.replace(/\/\*$/, '')));
    const problems = [];

    for (const alias of Object.keys(aliases))
        if (!declared.has(alias))
            problems.push(`${alias} is in scripts/aliases.mjs but not in front/tsconfig.json`);

    for (const alias of declared)
        if (!(alias in aliases))
            problems.push(`${alias} is in front/tsconfig.json but not in scripts/aliases.mjs`);

    return problems;
}

let failed = 0;

const aliasProblems = aliasesMatchTsconfig();
if (aliasProblems.length === 0) {
    console.log('  ok    the alias map and the tsconfig paths agree');
} else {
    failed++;
    console.log('  FAIL  the alias map and the tsconfig paths agree');
    console.log('        Vite and Vitest resolve through scripts/aliases.mjs; the editor and');
    console.log('        vue-tsc resolve through front/tsconfig.json. They must list the same aliases.');
    for (const problem of aliasProblems) console.log(`        - ${problem}`);
}

for (const rule of RULES) {
    const offenders = files.filter(rule.check);
    if (offenders.length === 0) {
        console.log(`  ok    ${rule.name}`);
        continue;
    }
    failed++;
    console.log(`  FAIL  ${rule.name}`);
    console.log(`        ${rule.why}`);
    for (const f of offenders) {
        const detail = rule.detail ? `  (${rule.detail(f)})` : '';
        console.log(`        - ${f.path}${detail}`);
    }
}

if (failed > 0) {
    console.log(`\n${failed} architecture rule(s) violated.`);
    process.exit(1);
}
console.log(`\nAll ${RULES.length + 1} architecture rules hold.`);
