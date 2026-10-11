import 'package:aventurette/core/core.dart';
import 'package:aventurette/features/activities/model/material.dart';
import 'package:aventurette/features/activities/model/step.dart';
import 'package:aventurette/features/activities/model/tag.dart';
import 'package:aventurette/features/activities/model/workshop.dart';

// ── The activity ────────────────────────────────────────────────────────────────────────────

/// An activity as the app uses it. What identifies it sits at the top, and every other attribute
/// is grouped by family, the way the activity sheet template reads (ADR 0015).
///
/// `steps`, `materials` and `workshops` are the records themselves, not their ids.
class ActivityData implements BaseEntity {
  const ActivityData({
    required this.id,
    required this.name,
    this.description = '',
    this.state,
    this.user = '',
    this.visual = '',
    this.visualBrief = '',
    this.classification = const ActivityClassification(),
    this.imaginary = const ActivityImaginary(),
    this.audience = const ActivityAudience(),
    this.supervision = const ActivitySupervision(),
    this.place = const ActivityPlace(),
    this.safety = const ActivitySafety(),
    this.pedagogy = const ActivityPedagogy(),
    this.steps = const [],
    this.materials = const [],
    this.workshops = const [],
  });

  @override
  final String id;
  final String name;

  /// Rich text.
  final String description;
  final ActivityState? state;

  /// The author's id.
  final String user;

  /// The stored name of the cover picture file.
  final String visual;

  /// What the cover visual has to show, until there is one.
  final String visualBrief;

  final ActivityClassification classification;
  final ActivityImaginary imaginary;
  final ActivityAudience audience;
  final ActivitySupervision supervision;
  final ActivityPlace place;
  final ActivitySafety safety;
  final ActivityPedagogy pedagogy;

  final List<ActivityStepData> steps;
  final List<ActivityMaterialData> materials;
  final List<ActivityWorkshopData> workshops;
}

enum ActivityState implements WireEnum {
  draft('DRAFT'),
  published('PUBLISHED');

  const ActivityState(this.wire);

  @override
  final String wire;
}

// ── Classification ──────────────────────────────────────────────────────────────────────────

/// What sorts an activity: its format, the practices of a workshop, and its stable subject.
class ActivityClassification {
  const ActivityClassification({this.format, this.practices = const [], this.themes = const []});

  final ActivityFormat? format;
  final List<ActivityPractice> practices;
  final List<ActivityTagData> themes;
}

enum ActivityFormat implements WireEnum {
  smallGame('SMALL_GAME'),
  bigGame('BIG_GAME'),
  workshop('WORKSHOP');

  const ActivityFormat(this.wire);

  @override
  final String wire;
}

enum ActivityPractice implements WireEnum {
  manualCreation('MANUAL_CREATION'),
  expression('EXPRESSION'),
  cooking('COOKING'),
  observation('OBSERVATION'),
  music('MUSIC'),
  experimentation('EXPERIMENTATION');

  const ActivityPractice(this.wire);

  @override
  final String wire;
}

// ── Imaginary ───────────────────────────────────────────────────────────────────────────────

/// The narrative universe an activity is dressed in, if any, and whether it may change.
class ActivityImaginary {
  const ActivityImaginary({this.rule, this.universes = const []});

  final ImaginaryRule? rule;
  final List<ActivityTagData> universes;
}

enum ImaginaryRule implements WireEnum {
  none('NONE'),
  adaptable('ADAPTABLE'),
  required('REQUIRED');

  const ImaginaryRule(this.wire);

  @override
  final String wire;
}

// ── Audience ────────────────────────────────────────────────────────────────────────────────

/// Who the activity is for. A 0 in a bound is unset: no limit on that side.
class ActivityAudience {
  const ActivityAudience({
    this.ageMin = 0,
    this.ageMax = 0,
    this.participantsMin = 0,
    this.participantsMax = 0,
    this.childrenPace,
    this.ageVariants = '',
  });

  final int ageMin;
  final int ageMax;
  final int participantsMin;
  final int participantsMax;
  final ChildrenPace? childrenPace;

  /// Rich text: how durations and rules adapt to each age range.
  final String ageVariants;
}

enum ChildrenPace implements WireEnum {
  calm('CALM'),
  dynamic('DYNAMIC');

  const ChildrenPace(this.wire);

  @override
  final String wire;
}

/// A bound of the audience as a range reads it: `null` is unset, no limit on that side.
typedef RangeEnd = int?;

/// A stored bound as a range reads it. PocketBase stores an empty number as 0, and no bound here
/// means anything by a 0 — so 0 is unset.
RangeEnd rangeEndOf(int? value) => (value == null || value == 0) ? null : value;

/// An audience's bounds on one side and the other, as a range reads them.
typedef AudienceRange = ({RangeEnd min, RangeEnd max});

/// The ages the activity is for.
AudienceRange ageRangeOf(ActivityAudience audience) {
  return (min: rangeEndOf(audience.ageMin), max: rangeEndOf(audience.ageMax));
}

/// How many may take part.
AudienceRange participantsRangeOf(ActivityAudience audience) {
  return (min: rangeEndOf(audience.participantsMin), max: rangeEndOf(audience.participantsMax));
}

// ── Supervision ─────────────────────────────────────────────────────────────────────────────

/// What running the activity asks of the adults.
class ActivitySupervision {
  const ActivitySupervision({
    this.hostEffort,
    this.hostsRequired = 0,
    this.crossSupervision = false,
    this.notes = '',
  });

  final HostEffort? hostEffort;

  /// Entered by the author until the supervision referential can compute it.
  final int hostsRequired;

  /// Whether an adult has to watch over every workshop, beyond those holding one.
  final bool crossSupervision;
  final String notes;
}

enum HostEffort implements WireEnum {
  low('LOW'),
  medium('MEDIUM'),
  high('HIGH');

  const HostEffort(this.wire);

  @override
  final String wire;
}

// ── Place ───────────────────────────────────────────────────────────────────────────────────

/// Where and when the activity can take place.
class ActivityPlace {
  const ActivityPlace({
    this.indoor = false,
    this.outdoor = false,
    this.locations = const [],
    this.conditions = '',
    this.seasons = const [],
  });

  final bool indoor;
  final bool outdoor;

  /// Background detail — does not replace the two flags above.
  final List<ActivityLocation> locations;

  /// Rich text: what is indispensable — space, ground, water, accessibility…
  final String conditions;
  final List<ActivitySeason> seasons;
}

enum ActivityLocation implements WireEnum {
  park('PARK'),
  house('HOUSE'),
  balcony('BALCONY'),
  car('CAR'),
  city('CITY'),
  campaign('CAMPAIGN'),
  forest('FOREST'),
  mountain('MOUNTAIN'),
  pool('POOL'),
  lake('LAKE'),
  river('RIVER'),
  bath('BATH'),
  meal('MEAL');

  const ActivityLocation(this.wire);

  @override
  final String wire;
}

enum ActivitySeason implements WireEnum {
  autumn('AUTUMN'),
  winter('WINTER'),
  spring('SPRING'),
  summer('SUMMER');

  const ActivitySeason(this.wire);

  @override
  final String wire;
}

// ── Safety ──────────────────────────────────────────────────────────────────────────────────

class ActivitySafety {
  const ActivitySafety({this.instructions = const []});

  final List<SafetyInstructionData> instructions;
}

/// The precautions one risk calls for: fire, water, food allergies… Reference data, as tags are:
/// an activity links them, it never writes them.
class SafetyInstructionData implements BaseEntity {
  const SafetyInstructionData({required this.id, required this.name, this.description = ''});

  @override
  final String id;
  final String name;

  /// Rich text.
  final String description;
}

// ── Pedagogy ────────────────────────────────────────────────────────────────────────────────

/// What the activity is good for, as the animator would say it, and what it develops.
class ActivityPedagogy {
  const ActivityPedagogy({this.goals = const [], this.idealFor = const [], this.development = const {}});

  final List<ActivityTagData> goals;
  final List<ActivityTagData> idealFor;
  final Map<ActivityTagType, List<ActivityTagData>> development;
}

/// The six developmental axes, each a kind of tag.
const developmentAxes = [
  ActivityTagType.developPhysical,
  ActivityTagType.developIntellectual,
  ActivityTagType.developAffect,
  ActivityTagType.developSocial,
  ActivityTagType.developMoral,
  ActivityTagType.developSpiritual,
];

// ── What the steps add up to ────────────────────────────────────────────────────────────────

/// Every resource attached to an activity's steps, each once, in first-use order.
List<ActivityResourceData> resourcesOf(ActivityData activity) {
  return distinctById(activity.steps.expand((step) => step.resources));
}

/// The two durations the sheet shows, in minutes.
typedef ActivityTiming = ({
  /// Before the children arrive: the steps preparing the game.
  int preparation,

  /// Every other step, from gathering the children to the conclusion.
  int play,
});

/// The activity's durations, as the sum of its steps' own. Gathering the material is a step the
/// app generates, not one the author writes, so it adds nothing.
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

  return (preparation: preparation, play: play);
}

/// How long the activity takes from start to finish, preparation included, in minutes.
int totalMinutesOf(ActivityData activity) {
  final timing = timingOf(activity);
  return timing.preparation + timing.play;
}
