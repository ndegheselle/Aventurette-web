/// One step of an activity, and what hangs off it: the materials it recalls, its resources and
/// its tips.
library;

import 'package:ajil/core/data/mapper.dart';

enum StepKind {
  /// Preparing the game, before the children arrive.
  prepare,

  /// A step the author wrote freely.
  custom,
  conclusion,
}

/// Something the activity needs, with how much of it: the activity's link to a catalogue
/// material. [name] is the catalogue material's, carried along so a list of them reads as one.
class ActivityMaterial implements Identified {
  const ActivityMaterial({required this.id, required this.name, this.quantity = ''});

  @override
  final String id;
  final String name;

  /// Free text: "one per team" is a quantity too.
  final String quantity;
}

/// A file uploaded for one step.
class StepResource implements Identified {
  const StepResource({required this.id, required this.name, required this.url});

  @override
  final String id;
  final String name;

  /// Where the stored file can be read.
  final String url;
}

/// A piece of advice for running a step, from the catalogue every step draws from.
class StepTip implements Identified {
  const StepTip({required this.id, required this.name, required this.description});

  @override
  final String id;
  final String name;

  /// Rich text.
  final String description;
}

class ActivityStep implements Identified {
  const ActivityStep({
    required this.id,
    required this.kind,
    this.title = '',
    this.description = '',
    this.duration = 0,
    this.visualUrl = '',
    this.advice = '',
    this.materials = const [],
    this.resources = const [],
    this.tips = const [],
  });

  @override
  final String id;
  final StepKind kind;
  final String title;

  /// Rich text.
  final String description;

  /// Estimated, in minutes. 0 when the author gave none.
  final int duration;

  /// Where the step's picture can be read. Empty when it has none.
  final String visualUrl;

  /// Rich text: advice written for this activity, where [tips] are the catalogue's.
  final String advice;

  /// The activity's own, recalled here.
  final List<ActivityMaterial> materials;
  final List<StepResource> resources;
  final List<StepTip> tips;
}

/// Whether a step has advice to show: the catalogue's tips, or its own.
bool hasAdvice(ActivityStep step) => step.tips.isNotEmpty || !isBlankHtml(step.advice);

/// Whether rich text holds no text: an editor emptied by hand leaves `<p></p>` behind.
bool isBlankHtml(String html) => html.replaceAll(RegExp(r'<[^>]*>'), '').replaceAll('&nbsp;', ' ').trim().isEmpty;

/// What a resource shows as its picture: its own url when it is an image, empty otherwise (a
/// PDF).
String pictureOf(StepResource resource) =>
    RegExp(r'\.(png|jpe?g|gif|webp)(\?|$)', caseSensitive: false).hasMatch(resource.url) ? resource.url : '';
