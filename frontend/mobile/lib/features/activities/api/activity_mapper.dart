import 'package:ajil/core/data/filters.dart';
import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/core/files/file_url_resolver.dart';
import 'package:ajil/features/activities/api/step_mapper.dart';
import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/models/catalogue_filters.dart';
import 'package:ajil/features/user/models/user.dart';

int _intOf(Object? value) => (value as num?)?.toInt() ?? 0;

/// PocketBase stores an empty number as 0, and no bound means anything by a 0: 0 is unset.
int? rangeEndOf(Object? value) {
  final bound = _intOf(value);
  return bound == 0 ? null : bound;
}

class ActivityTagMapper implements EntityMapper<ActivityTag> {
  const ActivityTagMapper();

  @override
  List<String> get relations => const [];

  @override
  ActivityTag toEntity(Payload payload, FileUrlResolver files) => ActivityTag(
    id: payload['id'] as String,
    name: (payload['name'] as String?) ?? '',
    type: enumOf(TagType.values, payload['type']),
  );

  @override
  Payload toPayload(ActivityTag entity) => throw UnimplementedError('tags are written from the back office');
}

class SafetyInstructionMapper implements EntityMapper<SafetyInstruction> {
  const SafetyInstructionMapper();

  @override
  List<String> get relations => const [];

  @override
  SafetyInstruction toEntity(Payload payload, FileUrlResolver files) => SafetyInstruction(
    id: payload['id'] as String,
    name: (payload['name'] as String?) ?? '',
    description: (payload['description'] as String?) ?? '',
  );

  @override
  Payload toPayload(SafetyInstruction entity) =>
      throw UnimplementedError('safety instructions are written from the back office');
}

class ActivityWorkshopMapper implements EntityMapper<ActivityWorkshop> {
  const ActivityWorkshopMapper();

  static const _materials = ActivityMaterialMapper();

  @override
  List<String> get relations => ['materials', for (final relation in _materials.relations) 'materials.$relation'];

  @override
  ActivityWorkshop toEntity(Payload payload, FileUrlResolver files) => ActivityWorkshop(
    id: payload['id'] as String,
    name: (payload['name'] as String?) ?? '',
    theme: (payload['theme'] as String?) ?? '',
    challenges: (payload['challenges'] as String?) ?? '',
    adultsRequired: _intOf(payload['adults_required']),
    materials: toEntities(payload, 'materials', _materials, files),
  );

  @override
  Payload toPayload(ActivityWorkshop entity) =>
      throw UnimplementedError('workshops are written by the activity editor');
}

/// The columns stay flat and the entity groups them by family (ADR 0015): this is where the two
/// meet. The app reads activities only; writing them is the editor's (A04, A19), not built yet.
class ActivityMapper implements EntityMapper<ActivityData> {
  const ActivityMapper();

  static const _steps = StepMapper();
  static const _materials = ActivityMaterialMapper();
  static const _workshops = ActivityWorkshopMapper();
  static const _tags = ActivityTagMapper();
  static const _safety = SafetyInstructionMapper();

  @override
  List<String> get relations => [
    'steps',
    for (final relation in _steps.relations) 'steps.$relation',
    'materials',
    for (final relation in _materials.relations) 'materials.$relation',
    'workshops',
    for (final relation in _workshops.relations) 'workshops.$relation',
    'theme_tags',
    'imaginary_tags',
    'goal_tags',
    'ideal_for_tags',
    'safety_instructions',
  ];

  @override
  ActivityData toEntity(Payload payload, FileUrlResolver files) {
    List<ActivityTag> tags(String relation) => toEntities(payload, relation, _tags, files);

    return ActivityData(
      id: payload['id'] as String,
      name: (payload['name'] as String?) ?? '',
      summary: (payload['summary'] as String?) ?? '',
      description: (payload['description'] as String?) ?? '',
      state: enumOf(ActivityState.values, payload['state']) ?? ActivityState.draft,
      user: (payload['user'] as String?) ?? '',
      classification: ActivityClassification(
        format: enumOf(ActivityFormat.values, payload['format']),
        practices: enumsOf(ActivityPractice.values, payload['practices']),
        themes: tags('theme_tags'),
      ),
      imaginary: ActivityImaginary(
        rule: enumOf(ImaginaryRule.values, payload['imaginary_rule']),
        universes: tags('imaginary_tags'),
      ),
      audience: ActivityAudience(
        ageMin: rangeEndOf(payload['age_min']),
        ageMax: rangeEndOf(payload['age_max']),
        participantsMin: rangeEndOf(payload['participants_min']),
        participantsMax: rangeEndOf(payload['participants_max']),
        childrenPace: enumOf(ChildrenPace.values, payload['children_pace']),
      ),
      supervision: ActivitySupervision(
        hostEffort: enumOf(HostEffort.values, payload['host_effort']),
        hostsRequired: _intOf(payload['recommended_hosts_numbers']),
        crossSupervision: (payload['cross_supervision'] as bool?) ?? false,
      ),
      place: ActivityPlace(
        indoor: (payload['indoor'] as bool?) ?? false,
        outdoor: (payload['outdoor'] as bool?) ?? false,
        locations: enumsOf(Location.values, payload['locations']),
        seasons: enumsOf(Season.values, payload['seasons']),
      ),
      safety: toEntities(payload, 'safety_instructions', _safety, files),
      pedagogy: ActivityPedagogy(goals: tags('goal_tags'), idealFor: tags('ideal_for_tags')),
      steps: toEntities(payload, 'steps', _steps, files),
      materials: toEntities(payload, 'materials', _materials, files),
      workshops: toEntities(payload, 'workshops', _workshops, files),
    );
  }

  @override
  Payload toPayload(ActivityData entity) => throw UnimplementedError('activities are written by the activity editor');
}

// ── The catalogue's filters ─────────────────────────────────────────────────────────────────

/// The range an activity is for — its ages or its participants — overlaps the one asked for. A
/// 0 in either column is unset: no limit on that side, so an activity with no upper age is for
/// every age from its lower one. A 0 lower bound is below any asked for, so it needs no case.
List<FilterNode> _rangesOverlap(String lower, String upper, int? min, int? max) => [
  if (min != null)
    FilterGroup([
      Filter(upper, min, operator: FilterOperator.greaterOrEquals, combine: FilterLogical.or),
      Filter(upper, 0, operator: FilterOperator.equals),
    ]),
  if (max != null) Filter(lower, max, operator: FilterOperator.lessOrEquals),
];

/// A list of choices: any one value chosen is enough. Nothing chosen filters on nothing.
List<FilterNode> _anyOf(String column, FilterOperator operator, List<Enum> values) => [
  if (values.isNotEmpty) Filter(column, [for (final value in values) constantOf(value)], operator: operator),
];

/// The catalogue's search and filters as the backend reads them, every one of them required.
///
/// A multiple select is compared through `:each`: `locations ?= 'PARK'` compares the whole stored
/// list and matches nothing, where `locations:each ?= 'PARK'` matches an activity holding it.
FilterGroup catalogueFilterOf(CatalogueFilters filters, String search) {
  final searched = search.trim();

  return FilterGroup([
    if (searched.isNotEmpty) searchFilter(searched, ['name', 'description']),
    ..._rangesOverlap('age_min', 'age_max', filters.ageMin, filters.ageMax),
    ..._rangesOverlap('participants_min', 'participants_max', filters.participantsMin, filters.participantsMax),
    ..._anyOf('locations:each', FilterOperator.anyEquals, filters.locations),
    ..._anyOf('format', FilterOperator.equals, filters.formats),
    ..._anyOf('practices:each', FilterOperator.anyEquals, filters.practices),
    ..._anyOf('children_pace', FilterOperator.equals, filters.childrenPaces),
    ..._anyOf('seasons:each', FilterOperator.anyEquals, filters.seasons),
  ]);
}
