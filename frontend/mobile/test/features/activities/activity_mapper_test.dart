import 'package:ajil/backend/pocketbase/filters.dart';
import 'package:ajil/features/activities/api/activity_mapper.dart';
import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/models/catalogue_filters.dart';
import 'package:ajil/features/activities/models/step.dart';
import 'package:ajil/features/user/models/user.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/fake_crud.dart';

const mapper = ActivityMapper();

ActivityData read(Map<String, dynamic> payload) => mapper.toEntity({'id': 'a1', ...payload}, const FakeFiles());

void main() {
  group('reading an activity', () {
    test('asks for every nested relation its steps, materials and workshops need', () {
      expect(
        mapper.relations,
        containsAll([
          'steps',
          'steps.materials',
          'steps.materials.material',
          'steps.resources',
          'steps.tips',
          'materials.material',
          'workshops.materials.material',
          'theme_tags',
          'safety_instructions',
        ]),
      );
    });

    test('groups the flat columns by family, choices read from the backend spelling', () {
      final activity = read({
        'format': 'BIG_GAME',
        'children_pace': 'DYNAMIC',
        'practices': ['MANUAL_CREATION', 'MUSIC'],
        'locations': ['PARK', 'FOREST'],
        'indoor': true,
        'recommended_hosts_numbers': 2,
      });

      expect(activity.classification.format, ActivityFormat.bigGame);
      expect(activity.audience.childrenPace, ChildrenPace.dynamic);
      expect(activity.classification.practices, [ActivityPractice.manualCreation, ActivityPractice.music]);
      expect(activity.place.locations, [Location.park, Location.forest]);
      expect(activity.place.indoor, isTrue);
      expect(activity.supervision.hostsRequired, 2);
    });

    test('reads an unset choice, and one this version does not know, as none', () {
      final activity = read({
        'format': '',
        'host_effort': 'EXTREME',
        'seasons': ['SUMMER', 'MONSOON'],
      });

      expect(activity.classification.format, isNull);
      expect(activity.supervision.hostEffort, isNull);
      expect(activity.place.seasons, [Season.summer]);
    });

    test('reads a stored 0 as an unset range end', () {
      final activity = read({'age_min': 6, 'age_max': 0, 'participants_min': 0});

      expect(activity.audience.ageMin, 6);
      expect(activity.audience.ageMax, isNull);
      expect(activity.audience.participantsMin, isNull);
    });

    test('inlines expanded relations down to the file urls, and reads an unexpanded one as empty', () {
      final activity = read({
        'steps': ['s1'],
        'theme_tags': ['t1'],
        'expand': {
          'steps': [
            {
              'id': 's1',
              'kind': 'PREPARE',
              'duration': 15,
              'resources': ['r1'],
              'expand': {
                'resources': [
                  {'id': 'r1', 'name': 'Indices', 'file': 'indices.png'},
                ],
                'materials': [
                  {
                    'id': 'm1',
                    'quantity': 'un par équipe',
                    'expand': {
                      'material': {'id': 'c1', 'name': 'Foulard'},
                    },
                  },
                ],
              },
            },
          ],
        },
      });

      final step = activity.steps.single;
      expect(step.kind, StepKind.prepare);
      expect(step.resources.single.url, 'files/r1/indices.png');
      expect(step.materials.single.name, 'Foulard');
      expect(step.materials.single.quantity, 'un par équipe');
      expect(activity.classification.themes, isEmpty, reason: 'theme_tags holds ids but was not expanded');
    });
  });

  group('the catalogue filter', () {
    String expression(CatalogueFilters filters, [String search = '']) =>
        filterExpressionOf(catalogueFilterOf(filters, search));

    test('filters on nothing when nothing is chosen or searched', () {
      expect(expression(const CatalogueFilters(), '  '), isEmpty);
    });

    test('keeps an activity whose ages overlap the ones asked for, an unset upper age being no limit', () {
      expect(expression(const CatalogueFilters(ageMin: 8, ageMax: 11)), "(age_max>=8 || age_max=0) && age_min<=11");
    });

    test('compares a multiple select value by value, and any one chosen is enough', () {
      expect(
        expression(const CatalogueFilters(locations: [Location.park, Location.forest])),
        "(locations:each?='PARK' || locations:each?='FOREST')",
      );
    });

    test('searches the name and the description', () {
      expect(expression(const CatalogueFilters(), 'remède'), "(name~'remède' || description~'remède')");
    });
  });
}
