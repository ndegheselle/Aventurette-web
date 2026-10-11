import 'package:aventurette/core/core.dart';
import 'package:aventurette/features/activities/api/material.mapper.dart';
import 'package:aventurette/features/activities/api/safety.mapper.dart';
import 'package:aventurette/features/activities/api/step.mapper.dart';
import 'package:aventurette/features/activities/api/tag.mapper.dart';
import 'package:aventurette/features/activities/api/workshop.mapper.dart';
import 'package:aventurette/features/activities/model/activity.dart';
import 'package:aventurette/features/activities/model/tag.dart';

/// The tag relations, one per place a tag goes in the families.
const _tagRelations = ['theme_tags', 'imaginary_tags', 'goal_tags', 'ideal_for_tags', 'development_tags'];

/// An activity as the backend stores it: `activities`, flat columns with relations stored as ids.
/// The columns stay flat and the entity groups them by family (ADR 0015), so this is where the
/// two meet.
///
/// A relation the request did not expand reads as empty, never as the ids the record carries.
class ActivityMapper implements EntityMapper<ActivityData> {
  const ActivityMapper();

  @override
  List<String> get relations => [
    'steps',
    ...stepMapper.relations.map((relation) => 'steps.$relation'),
    'materials',
    ...activityMaterialMapper.relations.map((relation) => 'materials.$relation'),
    'workshops',
    ...workshopMapper.relations.map((relation) => 'workshops.$relation'),
    ..._tagRelations,
    'safety_instructions',
  ];

  @override
  ActivityData toEntity(JsonMap payload, FileUrlResolver files) {
    List<ActivityTagData> tags(String relation) {
      return toEntities(expanded(payload, relation), tagMapper, files);
    }

    final developmentTags = tags('development_tags');

    return ActivityData(
      id: payload['id'] as String,
      name: asString(payload['name']),
      description: asString(payload['description']),
      state: choiceOf(ActivityState.values, payload['state']),
      user: asString(payload['user']),
      visual: asString(payload['visual']),
      visualBrief: asString(payload['visual_brief']),
      classification: ActivityClassification(
        format: choiceOf(ActivityFormat.values, payload['format']),
        practices: choicesOf(ActivityPractice.values, payload['practices']),
        themes: tags('theme_tags'),
      ),
      imaginary: ActivityImaginary(
        rule: choiceOf(ImaginaryRule.values, payload['imaginary_rule']),
        universes: tags('imaginary_tags'),
      ),
      audience: ActivityAudience(
        ageMin: asInt(payload['age_min']),
        ageMax: asInt(payload['age_max']),
        participantsMin: asInt(payload['participants_min']),
        participantsMax: asInt(payload['participants_max']),
        childrenPace: choiceOf(ChildrenPace.values, payload['children_pace']),
        ageVariants: asString(payload['age_variants']),
      ),
      supervision: ActivitySupervision(
        hostEffort: choiceOf(HostEffort.values, payload['host_effort']),
        hostsRequired: asInt(payload['recommended_hosts_numbers']),
        crossSupervision: asBool(payload['cross_supervision']),
        notes: asString(payload['supervision_notes']),
      ),
      place: ActivityPlace(
        indoor: asBool(payload['indoor']),
        outdoor: asBool(payload['outdoor']),
        locations: choicesOf(ActivityLocation.values, payload['locations']),
        conditions: asString(payload['conditions']),
        seasons: choicesOf(ActivitySeason.values, payload['seasons']),
      ),
      safety: ActivitySafety(
        instructions: toEntities(expanded(payload, 'safety_instructions'), safetyInstructionMapper, files),
      ),
      pedagogy: ActivityPedagogy(
        goals: tags('goal_tags'),
        idealFor: tags('ideal_for_tags'),
        // The six axes share one relation: the tag's kind sorts them apart.
        development: {
          for (final axis in developmentAxes) axis: developmentTags.where((tag) => tag.type == axis).toList(),
        },
      ),
      steps: toEntities(expanded(payload, 'steps'), stepMapper, files),
      materials: toEntities(expanded(payload, 'materials'), activityMaterialMapper, files),
      workshops: toEntities(expanded(payload, 'workshops'), workshopMapper, files),
    );
  }
}

const activityMapper = ActivityMapper();
