import { checkFiche, FicheFindingCode, REQUIRED_ROWS } from '@features/activities-authoring/models/fiche.check';
import { describe, expect, it } from 'vitest';

// A fiche is checked as its Markdown export reads: tables come out as aligned text, so a row is
// found by its label, and a long label is wrapped with its value's lines between its halves.

const rows = REQUIRED_ROWS.map(label => `  ${label.padEnd(36)}—`).join('\n');

function fiche({
    summary = 'Les équipes se parlent à la lampe.',
    informations = rows,
    steps = '### 1. Préparer le jeu\n\n**Durée estimée :** 30 min.\n\n### 2. Lancer le jeu\n\n**Durée estimée :** 40 min.',
    resources = '',
} = {}): string {
    return [
        '# Les Phares',
        `## Résumé\n\n${summary}`,
        '## Description\n\nDeux lignes de postes se font face.',
        `## Informations\n\n${informations}`,
        '## Matériel\n\n- Lampe torche',
        resources && `## Ressources\n\n${resources}`,
        `## Étapes\n\n${steps}`,
    ].filter(Boolean).join('\n\n');
}

const codes = (markdown: string) => checkFiche(markdown).findings.map(finding => finding.code);

describe('checkFiche', () => {
    it('finds nothing to report in a fiche that follows the template', () => {
        expect(checkFiche(fiche()).findings).toEqual([]);
    });

    it('reports each missing section and Informations row by name', () => {
        const markdown = fiche({ informations: rows.replace(/^.*Saison.*$/m, '') }).replace(/## Matériel[\s\S]*?(?=## Étapes)/, '');

        expect(checkFiche(markdown).findings).toEqual([
            { code: FicheFindingCode.SECTION, where: '', detail: 'Matériel' },
            { code: FicheFindingCode.ROW, where: 'Informations', detail: 'Saison' },
        ]);
    });

    it('finds a row whose label an export wrapped around its value', () => {
        const wrapped = rows.replace(/^.*Configuration des ateliers.*$/m,
            '  Configuration des ateliers et       2 lignes de 2 postes ;\n  contraintes d\'encadrement           1 adulte par ligne');

        expect(codes(fiche({ informations: wrapped }))).toEqual([]);
    });

    it('reports a step with no duration, and totals the steps do not add up to', () => {
        const informations = rows
            .replace(/^.*Temps de jeu.*$/m, '  Temps de jeu / activité             65 minutes')
            .replace(/^.*Temps de préparation.*$/m, '  Temps de préparation                60 min : 30 + 30');
        const steps = '### 1. Préparer le jeu\n\n**Durée estimée :** 30 min.\n\n### 2. Expliquer\n\nRaconter.\n\n'
            + '### 3. Lancer le jeu\n\n**Durée estimée :** 65 min.';

        expect(checkFiche(fiche({ informations, steps })).findings).toEqual([
            { code: FicheFindingCode.STEP_DURATION, where: '2. Expliquer', detail: '' },
            { code: FicheFindingCode.DURATION_TOTAL, where: 'Temps de préparation', detail: '30 / 60' },
        ]);
    });

    it('refuses a summary longer than an activity takes', () => {
        expect(codes(fiche({ summary: 'a'.repeat(301) }))).toEqual([FicheFindingCode.SUMMARY_LENGTH]);
    });

    it('takes resources as links to files, and reports text or a web page instead', () => {
        // An export can flatten the template's resources table into prose.
        expect(codes(fiche({ resources: 'Messages proposés : NORD, CAMP, AUBE.' }))).toEqual([FicheFindingCode.RESOURCE_TEXT]);

        const check = checkFiche(fiche({
            resources: '| Ressource |\n|---|\n| [Code Morse](ressources/morse.pdf) |\n| [Carte](https://example.org/carte) |',
            steps: '### 1. Lancer le jeu\n\n**Durée estimée :** 40 min.\n\n#### Ressources\n\n- [Messages](messages.pdf)',
        }));

        expect(check.links).toEqual([
            { where: 'Ressources', text: 'Code Morse', target: 'ressources/morse.pdf' },
            { where: '1. Lancer le jeu', text: 'Messages', target: 'messages.pdf' },
        ]);
        expect(check.findings).toEqual([
            { code: FicheFindingCode.RESOURCE_WEB_LINK, where: 'Ressources', detail: 'https://example.org/carte' },
        ]);
    });

    it('points at placeholders and « à valider » marks', () => {
        const markdown = fiche({ summary: '…\n\nAvec 3 animateurs **\\[à valider\\]**' });

        expect(codes(markdown)).toEqual([FicheFindingCode.PLACEHOLDER, FicheFindingCode.TO_VALIDATE]);
    });
});
