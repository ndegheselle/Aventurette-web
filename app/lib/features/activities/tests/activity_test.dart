import 'package:aventurette/features/activities/api/activity.mapper.dart';
import 'package:aventurette/features/activities/model/activity.dart';
import 'package:aventurette/features/activities/model/step.dart';
import 'package:aventurette/features/activities/model/tag.dart';
import 'package:aventurette/testing/testing.dart';
import 'package:flutter_test/flutter_test.dart';

final files = FakeFileUrls();

void main() {
  group('activityMapper', () {
    test('asks for the nested relations its steps, materials and workshops need', () {
      expect(activityMapper.relations, [
        'steps',
        'steps.materials',
        'steps.materials.material',
        'steps.resources',
        'steps.tips',
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
      ]);
    });

    test('inlines a relation of a relation, down to the file urls under it', () {
      final activity = activityMapper.toEntity(
        anActivityPayload({
          'steps': ['stp1'],
          'expand': {
            'steps': [
              aStepPayload({
                'id': 'stp1',
                'expand': {
                  'materials': [aMaterialLinkPayload(name: 'Rope')],
                  'resources': [
                    aResourcePayload({'id': 'res1', 'file': 'rules.pdf'}),
                  ],
                },
              }),
            ],
          },
        }),
        files,
      );

      final step = activity.steps.single;
      expect(step.materials.single.name, 'Rope');
      expect(step.resources.single.url, 'url:res1/rules.pdf');
    });

    test('reads a relation the request did not expand as empty, not as the ids it carries', () {
      final activity = activityMapper.toEntity(
        anActivityPayload({
          'steps': ['stp1'],
          'materials': ['lnk1'],
          'theme_tags': ['tag1'],
        }),
        files,
      );

      expect(activity.steps, isEmpty);
      expect(activity.materials, isEmpty);
      expect(activity.classification.themes, isEmpty);
    });

    test('groups the flat columns by family', () {
      final activity = activityMapper.toEntity(
        anActivityPayload({
          'format': 'BIG_GAME',
          'practices': ['COOKING', 'MUSIC'],
          'imaginary_rule': 'ADAPTABLE',
          'age_min': 6,
          'age_max': 10,
          'participants_min': 8,
          'children_pace': 'CALM',
          'host_effort': 'HIGH',
          'recommended_hosts_numbers': 2,
          'cross_supervision': true,
          'indoor': true,
          'locations': ['PARK'],
          'seasons': ['SUMMER'],
        }),
        files,
      );

      expect(activity.classification.format, ActivityFormat.bigGame);
      expect(activity.classification.practices, [ActivityPractice.cooking, ActivityPractice.music]);
      expect(activity.imaginary.rule, ImaginaryRule.adaptable);
      expect((activity.audience.ageMin, activity.audience.ageMax), (6, 10));
      expect(activity.audience.childrenPace, ChildrenPace.calm);
      expect(activity.supervision.hostEffort, HostEffort.high);
      expect(activity.supervision.hostsRequired, 2);
      expect(activity.supervision.crossSupervision, isTrue);
      expect(activity.place.indoor, isTrue);
      expect(activity.place.outdoor, isFalse);
      expect(activity.place.locations, [ActivityLocation.park]);
      expect(activity.place.seasons, [ActivitySeason.summer]);
    });

    test('reads the empty string PocketBase stores for an unset choice as null', () {
      final activity = activityMapper.toEntity(
        anActivityPayload({'format': '', 'imaginary_rule': '', 'children_pace': '', 'host_effort': ''}),
        files,
      );

      expect(activity.classification.format, isNull);
      expect(activity.imaginary.rule, isNull);
      expect(activity.audience.childrenPace, isNull);
      expect(activity.supervision.hostEffort, isNull);
    });

    test('puts each tag relation in its family, and sorts the development axes apart by kind', () {
      final activity = activityMapper.toEntity(
        anActivityPayload({
          'expand': {
            'theme_tags': [
              aTagPayload({'id': 't1', 'type': 'THEME'}),
            ],
            'imaginary_tags': [
              aTagPayload({'id': 'i1', 'type': 'IMAGINARY'}),
            ],
            'goal_tags': [
              aTagPayload({'id': 'g1', 'type': 'GOAL'}),
            ],
            'ideal_for_tags': [
              aTagPayload({'id': 'f1', 'type': 'IDEAL_FOR'}),
            ],
            'development_tags': [
              aTagPayload({'id': 'd1', 'type': 'DEVELOP_PHYSICAL'}),
              aTagPayload({'id': 'd2', 'type': 'DEVELOP_SOCIAL'}),
              aTagPayload({'id': 'd3', 'type': 'DEVELOP_PHYSICAL'}),
            ],
          },
        }),
        files,
      );

      expect(activity.classification.themes.single.id, 't1');
      expect(activity.imaginary.universes.single.id, 'i1');
      expect(activity.pedagogy.goals.single.id, 'g1');
      expect(activity.pedagogy.idealFor.single.id, 'f1');

      final development = activity.pedagogy.development;
      expect(development[ActivityTagType.developPhysical]!.map((tag) => tag.id), ['d1', 'd3']);
      expect(development[ActivityTagType.developSocial]!.map((tag) => tag.id), ['d2']);
      expect(development[ActivityTagType.developMoral], isEmpty);
    });

    test('puts the safety instructions in the safety family', () {
      final activity = activityMapper.toEntity(
        anActivityPayload({
          'expand': {
            'safety_instructions': [
              aSafetyInstructionPayload({'name': 'Fire'}),
            ],
          },
        }),
        files,
      );

      expect(activity.safety.instructions.single.name, 'Fire');
    });
  });

  group('resourcesOf', () {
    test('gathers the steps\' resources, each once, in first-use order', () {
      const shared = ActivityResourceData(id: 'res1', name: 'Rules');
      const other = ActivityResourceData(id: 'res2', name: 'Map');

      final activity = anActivity(
        steps: [
          aStep(id: 's1', resources: [shared, other]),
          aStep(id: 's2', resources: [shared]),
        ],
      );

      expect(resourcesOf(activity).map((resource) => resource.id), ['res1', 'res2']);
    });
  });

  group('timingOf', () {
    test('counts the steps preparing the game as preparation, and every other as play', () {
      final activity = anActivity(
        steps: [
          aStep(kind: StepKind.prepare, duration: 10),
          aStep(kind: StepKind.custom, duration: 20),
          aStep(kind: StepKind.conclusion, duration: 5),
        ],
      );

      expect(timingOf(activity), (preparation: 10, play: 25));
      expect(totalMinutesOf(activity), 35);
    });

    test('counts a step with no duration as 0', () {
      expect(totalMinutesOf(anActivity(steps: [aStep(), aStep(duration: 3)])), 3);
    });
  });

  group('rangeEndOf', () {
    test('reads a stored 0 as an unset end', () {
      expect(rangeEndOf(0), isNull);
      expect(rangeEndOf(null), isNull);
      expect(rangeEndOf(6), 6);
    });
  });
}
