import { columnOf, rangeEndOf, resourcesOf, timingOf } from '@features/activities/model/activity';
import { activityMapper } from '@features/activities/api/activity.mapper';
import { StepKind } from '@features/activities/model/step';
import { ActivityTagType } from '@features/activities/model/tag';
import {
    aMaterialPayload,
    aResource,
    aResourcePayload,
    aStep,
    aStepPayload,
    aTag,
    aTagPayload,
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
            'safety_tags',
            'goal_tags',
            'ideal_for_tags',
            'development_tags',
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
                safety_tags: [aTagPayload({ id: 'safety', type: ActivityTagType.SECURITY })],
                development_tags: [
                    aTagPayload({ id: 'social', type: ActivityTagType.DEVELOP_SOCIAL }),
                    aTagPayload({ id: 'moral', type: ActivityTagType.DEVELOP_MORAL }),
                ],
            },
        }), files);

        expect(activity.classification.themes.map(tag => tag.id)).toEqual(['theme']);
        expect(activity.safety.tags.map(tag => tag.id)).toEqual(['safety']);
        expect(activity.pedagogy.development.DEVELOP_SOCIAL.map(tag => tag.id)).toEqual(['social']);
        expect(activity.pedagogy.development.DEVELOP_MORAL.map(tag => tag.id)).toEqual(['moral']);
        expect(activity.pedagogy.development.DEVELOP_PHYSICAL).toEqual([]);
        expect(activity.safety.tags[0]).not.toHaveProperty('expand');
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
            anActivityPayload({ steps: ['stp1'], theme_tags: ['tag1'], materials: ['mat1'], workshops: ['wks1'] }),
            files,
        );

        expect(activity.steps).toEqual([]);
        expect(activity.materials).toEqual([]);
        expect(activity.workshops).toEqual([]);
        expect(activity.classification.themes).toEqual([]);
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

    it('writes relations as ids — saving an activity links its steps and tags, it does not save them', () => {
        const payload = activityMapper.toPayload(anActivity({
            steps: [aStep({ id: 'stp1' })],
            safety: { tags: [aTag({ id: 'tag1', type: ActivityTagType.SECURITY })] },
        }));

        expect(payload.steps).toEqual(['stp1']);
        expect(payload.safety_tags).toEqual(['tag1']);
    });

    it('leaves out what the caller did not mention, so an update stays partial', () => {
        expect(activityMapper.toPayload({ state: 'PUBLISHED' })).toEqual({ state: 'PUBLISHED' });
    });

    it("writes a family's tags with the family, and leaves the other families' alone", () => {
        const payload = activityMapper.toPayload({
            safety: { tags: [aTag({ id: 'tag1', type: ActivityTagType.SECURITY })] },
        });

        expect(payload).toEqual({ safety_tags: ['tag1'] });
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
                aStep({ kind: StepKind.EXPLAIN, duration: 5 }),
                aStep({ kind: StepKind.LAUNCH, duration: 20 }),
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
