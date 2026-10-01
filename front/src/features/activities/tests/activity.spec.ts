import { columnOf, rangeEndOf, resourcesOf, timingOf } from '@features/activities/model/activity';
import { activityMapper } from '@features/activities/api/activity.mapper';
import { StepKind } from '@features/activities/model/step';
import { ActivityTagType } from '@features/activities/model/tag';
import {
    aMaterialPayload,
    aResource,
    aResourcePayload,
    aSafetyInstruction,
    aSafetyInstructionPayload,
    aStep,
    aStepPayload,
    aTag,
    aTagPayload,
    aTip,
    aTipPayload,
    aWorkshopPayload,
    anActivity,
    anActivityPayload,
    fakeFileUrls,
} from '@tests';
import { describe, expect, it } from 'vitest';

const files = fakeFileUrls();

describe('activityMapper', () => {
    it('asks for the nested relations its steps, materials and workshops need, so each arrives whole', () => {
        expect(activityMapper.relations).toEqual([
            'steps',
            'steps.materials',
            'steps.materials.material',
            'steps.resources',
            'materials',
            'materials.material',
            'workshops',
            'workshops.materials',
            'workshops.materials.material',
            'theme_tags',
            'imaginary_tags',
            'goal_tags',
            'ideal_for_tags',
            'development_tags',
            'safety_instructions',
            'tips',
        ]);
    });

    it('inlines a relation of a relation, down to the file urls under it', () => {
        const activity = activityMapper.toEntity(anActivityPayload({
            steps: ['stp1'],
            expand: {
                steps: [aStepPayload({
                    id: 'stp1',
                    materials: ['mat1'],
                    resources: ['res1'],
                    expand: {
                        materials: [aMaterialPayload({ name: 'Rope' })],
                        resources: [aResourcePayload({ id: 'res1', file: 'rules.pdf' })],
                    },
                })],
            },
        }), files);

        expect(activity.steps[0]!.materials.map(material => material.name)).toEqual(['Rope']);
        expect(activity.steps[0]!.resources[0]!.url).toBe('https://files.test/res1/rules.pdf');
    });

    it('inlines the materials and the workshops, and the materials a workshop recalls', () => {
        const activity = activityMapper.toEntity(anActivityPayload({
            expand: {
                materials: [aMaterialPayload({ name: 'Rope', quantity: 'one per team' })],
                workshops: [aWorkshopPayload({
                    name: 'Knots',
                    expand: { materials: [aMaterialPayload({ name: 'Rope' })] },
                })],
            },
        }), files);

        expect(activity.materials.map(material => material.quantity)).toEqual(['one per team']);
        expect(activity.workshops[0]!.materials.map(material => material.name)).toEqual(['Rope']);
    });

    it('groups the columns by family', () => {
        const activity = activityMapper.toEntity(anActivityPayload({
            format: 'WORKSHOP',
            age_min: 3,
            age_max: 6,
            host_effort: 'HIGH',
            recommended_hosts_numbers: 2,
            indoor: true,
            seasons: ['SUMMER'],
            visual_brief: 'Children in a circle',
        }), files);

        expect(activity.classification.format).toBe('WORKSHOP');
        expect(activity.audience).toMatchObject({ ageMin: 3, ageMax: 6 });
        expect(activity.supervision).toMatchObject({ hostEffort: 'HIGH', hostsRequired: 2 });
        expect(activity.place).toMatchObject({ indoor: true, outdoor: false, seasons: ['SUMMER'] });
        expect(activity.visualBrief).toBe('Children in a circle');
        expect(activity).not.toHaveProperty('age_min');
    });

    it('reads each tag relation into its family, and sorts the development axes apart by kind', () => {
        const activity = activityMapper.toEntity(anActivityPayload({
            expand: {
                theme_tags: [aTagPayload({ id: 'theme', type: ActivityTagType.THEME })],
                development_tags: [
                    aTagPayload({ id: 'social', type: ActivityTagType.DEVELOP_SOCIAL }),
                    aTagPayload({ id: 'moral', type: ActivityTagType.DEVELOP_MORAL }),
                ],
            },
        }), files);

        expect(activity.classification.themes.map(tag => tag.id)).toEqual(['theme']);
        expect(activity.pedagogy.development.DEVELOP_SOCIAL.map(tag => tag.id)).toEqual(['social']);
        expect(activity.pedagogy.development.DEVELOP_MORAL.map(tag => tag.id)).toEqual(['moral']);
        expect(activity.pedagogy.development.DEVELOP_PHYSICAL).toEqual([]);
        expect(activity.classification.themes[0]).not.toHaveProperty('expand');
    });

    it('reads the safety instructions into the safety family, and the tips beside the steps', () => {
        const activity = activityMapper.toEntity(anActivityPayload({
            expand: {
                safety_instructions: [aSafetyInstructionPayload({ id: 'fire' })],
                tips: [aTipPayload({ id: 'pace' })],
            },
        }), files);

        expect(activity.safety.instructions.map(instruction => instruction.id)).toEqual(['fire']);
        expect(activity.tips.map(tip => tip.id)).toEqual(['pace']);
        expect(activity.safety.instructions[0]).not.toHaveProperty('expand');
        expect(activity.tips[0]).not.toHaveProperty('expand');
    });

    it('writes back every development tag it read, whatever its axis', () => {
        // An axis missing from DEVELOPMENT_AXES would be dropped on read and unlinked on save.
        const axes = Object.values(ActivityTagType).filter(type => type.startsWith('DEVELOP_'));
        const tags = axes.map(type => aTagPayload({ id: type, type }));
        const activity = activityMapper.toEntity(anActivityPayload({ expand: { development_tags: tags } }), files);

        expect(activityMapper.toPayload(activity).development_tags).toEqual(axes);
    });

    it('writes the six development axes back into their one relation', () => {
        const activity = anActivity();
        activity.pedagogy.development.DEVELOP_SOCIAL = [aTag({ id: 'social', type: ActivityTagType.DEVELOP_SOCIAL })];
        activity.pedagogy.development.DEVELOP_MORAL = [aTag({ id: 'moral', type: ActivityTagType.DEVELOP_MORAL })];

        expect(activityMapper.toPayload(activity).development_tags).toEqual(['social', 'moral']);
    });

    it('reads a relation the request did not expand as empty', () => {
        const activity = activityMapper.toEntity(
            anActivityPayload({
                steps: ['stp1'], theme_tags: ['tag1'], materials: ['mat1'], workshops: ['wks1'],
                safety_instructions: ['sfi1'], tips: ['tip1'],
            }),
            files,
        );

        expect(activity.steps).toEqual([]);
        expect(activity.materials).toEqual([]);
        expect(activity.workshops).toEqual([]);
        expect(activity.classification.themes).toEqual([]);
        expect(activity.safety.instructions).toEqual([]);
        expect(activity.tips).toEqual([]);
        expect(activity).not.toHaveProperty('expand');
    });

    it('flattens the families back into columns', () => {
        const payload = activityMapper.toPayload(anActivity({
            audience: { ageMin: 3, ageMax: 6, participantsMin: 4, participantsMax: 12, childrenPace: 'CALM', ageVariants: '' },
            place: { indoor: false, outdoor: true, locations: ['FOREST'], conditions: '', seasons: [] },
        }));

        expect(payload).toMatchObject({
            age_min: 3,
            age_max: 6,
            participants_min: 4,
            participants_max: 12,
            children_pace: 'CALM',
            outdoor: true,
            locations: ['FOREST'],
        });
        expect(payload).not.toHaveProperty('audience');
        expect(payload).not.toHaveProperty('place');
    });

    it('reads an unset choice as null, and writes it back as the empty string that clears it', () => {
        const activity = activityMapper.toEntity(anActivityPayload({ host_effort: 'HIGH' }), files);

        expect(activity.classification.format).toBeNull();
        expect(activity.supervision.hostEffort).toBe('HIGH');

        // Not undefined: a key left out of an update leaves the stored choice in place.
        activity.supervision.hostEffort = null;
        expect(activityMapper.toPayload(activity)).toMatchObject({ format: '', host_effort: '' });
    });

    it('writes relations as ids — saving an activity links its steps, tags and tips, it does not save them', () => {
        const payload = activityMapper.toPayload(anActivity({
            steps: [aStep({ id: 'stp1' })],
            classification: { format: null, practices: [], themes: [aTag({ id: 'tag1' })] },
            safety: { instructions: [aSafetyInstruction({ id: 'sfi1' })] },
            tips: [aTip({ id: 'tip1' })],
        }));

        expect(payload.steps).toEqual(['stp1']);
        expect(payload.theme_tags).toEqual(['tag1']);
        expect(payload.safety_instructions).toEqual(['sfi1']);
        expect(payload.tips).toEqual(['tip1']);
    });

    it('leaves out what the caller did not mention, so an update stays partial', () => {
        expect(activityMapper.toPayload({ state: 'PUBLISHED' })).toEqual({ state: 'PUBLISHED' });
    });

    it("writes a family's links with the family, and leaves the other families' alone", () => {
        const payload = activityMapper.toPayload({
            safety: { instructions: [aSafetyInstruction({ id: 'sfi1' })] },
        });

        expect(payload).toEqual({ safety_instructions: ['sfi1'] });
    });
});

describe('resourcesOf', () => {
    it('gathers the files attached to the steps, deduplicated by id', () => {
        const sheet = aResource({ name: 'Rules' });
        const activity = anActivity({
            steps: [aStep({ resources: [sheet] }), aStep({ resources: [{ ...sheet }] })],
        });

        expect(resourcesOf(activity)).toHaveLength(1);
    });

    it('is empty for an activity that has not loaded yet', () => {
        expect(resourcesOf(null)).toEqual([]);
    });
});

describe('timingOf', () => {
    it('counts the steps preparing the game as preparation, and every other as play', () => {
        const activity = anActivity({
            steps: [
                aStep({ kind: StepKind.PREPARE, duration: 10 }),
                aStep({ kind: StepKind.CUSTOM, duration: 5 }),
                aStep({ kind: StepKind.CUSTOM, duration: 20 }),
                aStep({ kind: StepKind.CONCLUSION, duration: 5 }),
            ],
        });

        expect(timingOf(activity)).toEqual({ preparation: 10, play: 30 });
    });

    it('counts a step with no duration as nothing', () => {
        expect(timingOf(anActivity({ steps: [aStep({ duration: 0 })] }))).toEqual({ preparation: 0, play: 0 });
        expect(timingOf(null)).toEqual({ preparation: 0, play: 0 });
    });
});

describe('rangeEndOf', () => {
    it('reads a stored 0 as unset, which is what PocketBase stores for an empty number', () => {
        // Otherwise a new activity's ageMax of 0 would pin the upper thumb to the floor.
        expect(rangeEndOf(0)).toBeNull();
        expect(rangeEndOf(undefined)).toBeNull();
        expect(rangeEndOf(6)).toBe(6);
    });

    it('stores an unset end as 0, and a set one as it is', () => {
        expect(columnOf(null)).toBe(0);
        expect(columnOf(6)).toBe(6);
    });
});
