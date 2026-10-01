import { GeneratedStepKind, playStepsOf } from '@features/activities/model/play';
import { EndCriterion, StepKind } from '@features/activities/model/step';
import { aMaterial, aStep, anActivity } from '@tests';
import { describe, expect, it } from 'vitest';

const kindsOf = (activity: Parameters<typeof playStepsOf>[0]) => playStepsOf(activity).map(step => step.kind);

describe('playStepsOf', () => {
    it('gathers the material first, before anything is set up', () => {
        const activity = anActivity({
            materials: [aMaterial({ name: 'Rope' })],
            steps: [aStep({ kind: StepKind.PREPARE }), aStep({ kind: StepKind.EXPLAIN })],
        });

        expect(kindsOf(activity)).toEqual([
            GeneratedStepKind.GATHER_MATERIAL,
            StepKind.PREPARE,
            GeneratedStepKind.GATHER_CHILDREN,
            StepKind.EXPLAIN,
        ]);
    });

    it('has no material to gather when the activity needs none', () => {
        const activity = anActivity({ steps: [aStep({ kind: StepKind.EXPLAIN })] });

        expect(kindsOf(activity)).not.toContain(GeneratedStepKind.GATHER_MATERIAL);
    });

    it('gathers the children before the first step that is not preparing the game', () => {
        // A preparation step written after the game started is still played where it was written.
        const activity = anActivity({
            steps: [
                aStep({ kind: StepKind.PREPARE }),
                aStep({ kind: StepKind.PREPARE }),
                aStep({ kind: StepKind.LAUNCH }),
                aStep({ kind: StepKind.PREPARE }),
            ],
        });

        expect(kindsOf(activity)).toEqual([
            StepKind.PREPARE,
            StepKind.PREPARE,
            GeneratedStepKind.GATHER_CHILDREN,
            StepKind.LAUNCH,
            StepKind.PREPARE,
        ]);
    });

    it('gathers the children first when nothing is prepared', () => {
        const activity = anActivity({ steps: [aStep({ kind: StepKind.EXPLAIN })] });

        expect(kindsOf(activity)).toEqual([GeneratedStepKind.GATHER_CHILDREN, StepKind.EXPLAIN]);
    });

    it('does not gather the children when every step prepares the game', () => {
        const activity = anActivity({ steps: [aStep({ kind: StepKind.PREPARE })] });

        expect(kindsOf(activity)).toEqual([StepKind.PREPARE]);
    });

    it('is no step at all for an activity not loaded yet', () => {
        expect(playStepsOf(null)).toEqual([]);
    });

    it('ticks each material while gathering it, with how much of it', () => {
        const activity = anActivity({
            materials: [aMaterial({ name: 'Rope', quantity: 'one per team' }), aMaterial({ name: 'Chalk', quantity: '' })],
        });

        expect(playStepsOf(activity)[0]!.actions).toEqual(['Rope — one per team', 'Chalk']);
    });

    it('keeps the end criteria of the step announcing the end only', () => {
        const activity = anActivity({
            steps: [
                aStep({ kind: StepKind.CUSTOM, end_criteria: [EndCriterion.TIME_UP], end_criteria_other: 'Rain' }),
                aStep({ kind: StepKind.ANNOUNCE_END, end_criteria: [EndCriterion.TEAM_WON], end_criteria_other: 'Dusk' }),
            ],
        });

        const [, custom, announce] = playStepsOf(activity);

        expect(custom).toMatchObject({ endCriteria: [], endCriteriaOther: '' });
        expect(announce).toMatchObject({ endCriteria: [EndCriterion.TEAM_WON], endCriteriaOther: 'Dusk' });
    });
});
