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
    .filter(f => /\.(ts|vue|mts|js)$/.test(f))
    .map(f => ({
        path: posix.join(...relative(ROOT, f).split(sep)),
        get text() {
            const value = readFileSync(f, 'utf8');
            Object.defineProperty(this, 'text', { value });
            return value;
        },
    }));

/**
 * daisyUI *component* classes. Token utilities (bg-base-*, text-base-content, rounded-box,
 * border-base-*) are intentionally not listed: those are the theme layer, and any replacement
 * CSS library would have to provide equivalents anyway.
 */
const DAISY_COMPONENT = /^(btn|input|select|checkbox|radio|toggle|badge|modal|alert|card|steps|step|menu|navbar|table|toast|join|fieldset|skeleton|list|dropdown|loading|tabs|tab|divider|footer|kbd|progress|avatar|indicator|collapse|drawer|hero|stat|swap|range|textarea|file-input|label|form-control|list-row|modal-box|modal-action|modal-backdrop|fieldset-legend|menu-title|join-item|dropdown-content|label-text|card-body|card-title|card-actions|footer-center)(-[a-z0-9]+)*$/;
const CLASS_ATTR = /(?:^|\s):?class="([^"]*)"/gs;
const QUOTED = /'([^']*)'/g;

function daisyComponentClasses(text) {
    const found = [];
    for (const match of text.matchAll(CLASS_ATTR)) {
        const body = match[1];
        const tokens = /[{[]/.test(body)
            ? [...body.matchAll(QUOTED)].flatMap(q => q[1].split(/\s+/))
            : body.split(/\s+/);
        for (const token of tokens) {
            if (token && DAISY_COMPONENT.test(token)) found.push(token);
        }
    }
    return found;
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
        name: 'backend wiring is consumed through a feature data layer',
        why: "Components must not import @/backend; go through features/<name>/data/.",
        check: f => f.path.startsWith('front/src/')
            && !/^front\/src\/features\/[^/]+\/data\//.test(f.path)
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
        name: 'feature model/ and data/ are framework-free',
        why: 'Domain types and repositories should outlive the view layer.',
        check: f => /^front\/src\/features\/[^/]+\/(model|data)\//.test(f.path)
            && /from ['"](vue|vue-i18n|vue-router|@chapelure\/ui)/.test(f.text),
    },
    {
        name: '@chapelure/ui depends on neither the app nor the backend',
        why: 'The design system has to stay reusable by a second app.',
        check: f => f.path.startsWith('packages/ui/')
            && /from ['"](@\/|@features\/|@chapelure\/pocketbase)/.test(f.text),
    },
    {
        name: 'daisyUI component classes live only in the design system',
        why: 'This is what makes swapping the CSS library a packages/ui job.',
        check: f => f.path.endsWith('.vue')
            && !f.path.startsWith('packages/ui/')
            && daisyComponentClasses(f.text).length > 0,
        detail: f => [...new Set(daisyComponentClasses(f.text))].join(' '),
    },
    {
        name: 'the icon set has a single import site',
        why: 'Swapping icon libraries should be one file, not every component.',
        check: f => f.path !== 'packages/ui/src/icons.ts'
            && /from ['"]lucide-vue-next['"]/.test(f.text),
    },
];

let failed = 0;
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
console.log(`\nAll ${RULES.length} architecture rules hold.`);
