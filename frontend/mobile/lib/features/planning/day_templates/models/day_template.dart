/// A day template: a day's timeline, reused to start an event.
library;

import 'package:ajil/core/data/mapper.dart';

/// Whose templates are listed: Ajil's, the user's structure's, or the user's own.
enum TemplateSource { ajil, structure, personal }

class DayTemplate implements Identified {
  const DayTemplate({
    required this.id,
    required this.name,
    this.owner,
    this.summary = '',
    this.startMinutes,
    this.endMinutes,
  });

  @override
  final String id;

  /// Null for one of Ajil's.
  final String? owner;
  final String name;

  /// What the day holds, in a line: *Accueil · rassemblement · repas · services*.
  final String summary;

  /// Minutes since midnight. Null when the template sets no time.
  final int? startMinutes;
  final int? endMinutes;
}

/// Hours and minutes of a time of day given in minutes since midnight.
({int hours, int minutes}) clockOf(int minutesOfDay) => (hours: minutesOfDay ~/ 60, minutes: minutesOfDay % 60);
