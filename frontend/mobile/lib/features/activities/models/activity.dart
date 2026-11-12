/// An activity as the app uses it: what identifies it, then its attributes grouped by family,
/// the way the activity sheet reads (ADR 0015). `api/activity_mapper.dart` flattens the families
/// back into columns.
library;

import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/features/activities/models/step.dart';
import 'package:ajil/features/user/models/user.dart';

enum ActivityState { draft, published }

enum ActivityFormat { smallGame, bigGame, workshop }

enum ActivityPractice { manualCreation, expression, cooking, observation, music, experimentation }

enum ImaginaryRule { none, adaptable, required }

enum ChildrenPace { calm, dynamic }

enum HostEffort { low, medium, high }

enum Season { autumn, winter, spring, summer }

/// The kinds of tag, told apart by `type` in one collection (ADR 0014).
enum TagType {
  theme,
  imaginary,
  goal,
  idealFor,
  developPhysical,
  developIntellectual,
  developAffect,
  developSocial,
  developMoral,
  developSpiritual,
}

/// A tag an activity carries. Reference data: an activity links tags, it never writes them.
/// Named in French whatever the locale.
class ActivityTag implements Identified {
  const ActivityTag({required this.id, required this.name, required this.type});

  @override
  final String id;
  final String name;
  final TagType? type;
}

/// The precautions one risk calls for: fire, water, food allergies… Reference data, as tags are.
class SafetyInstruction implements Identified {
  const SafetyInstruction({required this.id, required this.name, required this.description});

  @override
  final String id;
  final String name;

  /// Rich text.
  final String description;
}

class ActivityClassification {
  const ActivityClassification({this.format, this.practices = const [], this.themes = const []});

  final ActivityFormat? format;
  final List<ActivityPractice> practices;
  final List<ActivityTag> themes;
}

/// The narrative universe an activity is dressed in, if any, and whether it may change.
class ActivityImaginary {
  const ActivityImaginary({this.rule, this.universes = const []});

  final ImaginaryRule? rule;
  final List<ActivityTag> universes;
}

/// Who the activity is for. A null bound is unset: no limit on that side.
class ActivityAudience {
  const ActivityAudience({this.ageMin, this.ageMax, this.participantsMin, this.participantsMax, this.childrenPace});

  final int? ageMin;
  final int? ageMax;
  final int? participantsMin;
  final int? participantsMax;
  final ChildrenPace? childrenPace;
}

/// What running the activity asks of the adults.
class ActivitySupervision {
  const ActivitySupervision({this.hostEffort, this.hostsRequired = 0, this.crossSupervision = false});

  final HostEffort? hostEffort;

  /// Entered by the author until the supervision referential can compute it.
  final int hostsRequired;

  /// Whether an adult has to watch over every workshop, beyond those holding one.
  final bool crossSupervision;
}

/// Where and when the activity can take place.
class ActivityPlace {
  const ActivityPlace({this.indoor = false, this.outdoor = false, this.locations = const [], this.seasons = const []});

  final bool indoor;
  final bool outdoor;
  final List<Location> locations;
  final List<Season> seasons;
}

/// What the activity is good for, as the animator would say it.
class ActivityPedagogy {
  const ActivityPedagogy({this.goals = const [], this.idealFor = const []});

  final List<ActivityTag> goals;
  final List<ActivityTag> idealFor;
}

class ActivityData implements Identified {
  const ActivityData({
    required this.id,
    required this.name,
    this.summary = '',
    this.description = '',
    this.state = ActivityState.draft,
    this.user = '',
    this.classification = const ActivityClassification(),
    this.imaginary = const ActivityImaginary(),
    this.audience = const ActivityAudience(),
    this.supervision = const ActivitySupervision(),
    this.place = const ActivityPlace(),
    this.safety = const [],
    this.pedagogy = const ActivityPedagogy(),
    this.steps = const [],
    this.materials = const [],
    this.workshops = const [],
  });

  @override
  final String id;
  final String name;

  /// A few plain sentences presenting the activity, under its title.
  final String summary;

  /// Rich text.
  final String description;
  final ActivityState state;

  /// The author's id.
  final String user;

  final ActivityClassification classification;
  final ActivityImaginary imaginary;
  final ActivityAudience audience;
  final ActivitySupervision supervision;
  final ActivityPlace place;
  final List<SafetyInstruction> safety;
  final ActivityPedagogy pedagogy;

  /// The records themselves, not their ids.
  final List<ActivityStep> steps;
  final List<ActivityMaterial> materials;
  final List<ActivityWorkshop> workshops;
}

/// One of the stations an activity runs in parallel, and how many adults it takes to hold it.
class ActivityWorkshop implements Identified {
  const ActivityWorkshop({
    required this.id,
    required this.name,
    this.theme = '',
    this.challenges = '',
    this.adultsRequired = 0,
    this.materials = const [],
  });

  @override
  final String id;
  final String name;
  final String theme;

  /// Rich text.
  final String challenges;
  final int adultsRequired;
  final List<ActivityMaterial> materials;
}

// ── What the steps add up to ────────────────────────────────────────────────────────────────

/// Every resource attached to an activity's steps, each once, in first-use order.
List<StepResource> resourcesOf(ActivityData activity) {
  final seen = <String>{};
  return [
    for (final step in activity.steps)
      for (final resource in step.resources)
        if (seen.add(resource.id)) resource,
  ];
}

/// The durations the sheet shows, in minutes.
class ActivityTiming {
  const ActivityTiming({required this.preparation, required this.play});

  /// Before the children arrive: the steps preparing the game.
  final int preparation;

  /// Every other step, from gathering the children to the conclusion.
  final int play;

  int get total => preparation + play;
}

/// The activity's durations, as the sum of its steps' own. A step with no duration counts as 0.
ActivityTiming timingOf(ActivityData activity) {
  var preparation = 0;
  var play = 0;

  for (final step in activity.steps) {
    if (step.kind == StepKind.prepare) {
      preparation += step.duration;
    } else {
      play += step.duration;
    }
  }

  return ActivityTiming(preparation: preparation, play: play);
}
