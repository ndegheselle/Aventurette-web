/// How dates, periods and events read, in the app's language.
library;

import 'package:ajil/features/planning/models/day_plan.dart';
import 'package:ajil/features/planning/models/event.dart';
import 'package:ajil/features/planning/models/period.dart';
import 'package:ajil/features/planning/models/scheduled_activity.dart';
import 'package:ajil/ui/i18n/strings.g.dart';

String _capitalised(String text) => text.isEmpty ? text : text[0].toUpperCase() + text.substring(1);

String _month(Translations t, DateTime day) => t.planning.dates.months[day.month - 1];

String _withYear(Translations t, String date, DateTime day) => t.planning.dates.withYear(date: date, year: day.year);

/// *9h30*, or *10h* on the hour, for a time given in minutes since midnight.
String clockText(Translations t, int minutesOfDay) {
  final hours = minutesOfDay ~/ 60;
  final minutes = minutesOfDay % 60;
  return minutes == 0
      ? t.planning.dates.hour(hours: hours)
      : t.planning.dates.time(hours: hours, minutes: minutes.toString().padLeft(2, '0'));
}

String _clock(Translations t, DateTime moment) => clockText(t, moment.hour * 60 + moment.minute);

/// *9h30–17h30*.
String _times(Translations t, DateTime start, DateTime end) =>
    t.planning.dates.times(from: _clock(t, start), to: _clock(t, end));

/// *21 novembre*.
String _day(Translations t, DateTime day) => t.planning.dates.day(day: day.day, month: _month(t, day));

/// *Samedi 21 novembre*.
String _fullDay(Translations t, DateTime day) {
  final dates = t.planning.dates;
  return _capitalised(dates.fullDay(weekday: dates.weekdays[day.weekday - 1], day: day.day, month: _month(t, day)));
}

/// *21 novembre*, *28–29 novembre*, *30 novembre – 2 décembre*; with the year when [withYear],
/// on each side when the days are in two years.
String _days(Translations t, DateTime first, DateTime last, {required bool withYear}) {
  final dates = t.planning.dates;
  if (first.year != last.year && withYear) {
    return dates.range(from: _withYear(t, _day(t, first), first), to: _withYear(t, _day(t, last), last));
  }

  final String text;
  if (first == last) {
    text = _day(t, first);
  } else if (first.month == last.month) {
    text = dates.dayRange(from: first.day, to: last.day, month: _month(t, last));
  } else {
    text = dates.range(from: _day(t, first), to: _day(t, last));
  }
  return withYear ? _withYear(t, text, last) : text;
}

/// The period shown: *Samedi 21 novembre 2026*, *16–22 novembre 2026*, *Novembre 2026*, *2026*.
String periodTitle(Translations t, TimeRange range, Period period) => switch (range) {
  TimeRange.day => _withYear(t, _fullDay(t, period.from), period.from),
  TimeRange.week => _days(t, period.from, period.lastDay, withYear: true),
  TimeRange.month => _withYear(t, _capitalised(_month(t, period.from)), period.from),
  TimeRange.year => '${period.from.year}',
};

/// A group's heading, within a period of [range]: a week's day, a month's week, a year's month.
String partTitle(Translations t, TimeRange range, Period part) => switch (range) {
  TimeRange.day || TimeRange.week => _fullDay(t, part.from),
  TimeRange.month => _days(t, part.from, part.lastDay, withYear: false),
  TimeRange.year => _capitalised(_month(t, part.from)),
};

/// An event's line under its name: its times on one day, its days otherwise, then its status —
/// *9h30–17h30 · Préparation en cours*, *28–29 novembre*.
String eventSubtitle(Translations t, PlanningEvent event) => [
  onOneDay(event) ? _times(t, event.start, event.end) : _days(t, dayOf(event.start), lastDayOf(event), withYear: false),
  if (event.status case final status?) t.planning.status[status.name]!,
].join(' · ');

/// A planned activity's time: *9h30–10h15*.
String slotText(Translations t, PlannedActivity activity) =>
    t.planning.dates.times(from: clockText(t, activity.start), to: clockText(t, activity.end));

/// A saved activity's time on the planning: *9h30–10h15* where its group is a day, with its day
/// before — *21 novembre · 9h30–10h15* — where the group spans several.
String scheduledText(Translations t, TimeRange range, ScheduledActivity activity) {
  final times = _times(t, activity.start, activity.end);
  return switch (range) {
    TimeRange.day || TimeRange.week => times,
    TimeRange.month || TimeRange.year => '${_day(t, activity.start)} · $times',
  };
}
