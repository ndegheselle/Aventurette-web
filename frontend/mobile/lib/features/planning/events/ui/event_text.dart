/// How dates, times and events read, in the app's language.
library;

import 'package:ajil/features/planning/events/models/calendar.dart';
import 'package:ajil/features/planning/events/models/event.dart';
import 'package:ajil/ui/i18n/strings.g.dart';

String _capitalised(String text) => text.isEmpty ? text : text[0].toUpperCase() + text.substring(1);

String _month(Translations t, DateTime day) => t.events.dates.months[day.month - 1];

/// *9h30*, or *10h* on the hour.
String clockText(Translations t, int hours, int minutes) => minutes == 0
    ? t.events.dates.hour(hours: hours)
    : t.events.dates.time(hours: hours, minutes: minutes.toString().padLeft(2, '0'));

String timeText(Translations t, DateTime moment) => clockText(t, moment.hour, moment.minute);

/// *9h30–17h30*.
String timesText(Translations t, DateTime start, DateTime end) =>
    t.events.dates.times(from: timeText(t, start), to: timeText(t, end));

/// *21 novembre*.
String dayText(Translations t, DateTime day) => t.events.dates.day(day: day.day, month: _month(t, day));

/// *21 novembre · 9h30–17h30*, *28–29 novembre*, *30 novembre – 2 décembre*.
String eventDatesText(Translations t, PlanningEvent event) {
  final last = lastDayOf(event);
  return switch (spanOf(event)) {
    EventSpan.oneDay => '${dayText(t, event.start)} · ${timesText(t, event.start, event.end)}',
    EventSpan.sameMonth => t.events.dates.dayRange(from: event.start.day, to: last.day, month: _month(t, last)),
    EventSpan.acrossMonths => t.events.dates.range(from: dayText(t, event.start), to: dayText(t, last)),
  };
}

String? statusText(Translations t, PlanningEvent event) =>
    event.status == null ? null : t.events.status[event.status!.name];

/// A calendar card's title: *Sam. 21 · Sortie SG*.
String calendarTitle(Translations t, PlanningEvent event) =>
    '${t.events.dates.weekdaysShort[event.start.weekday - 1]} ${event.start.day} · ${event.name}';

/// A calendar card's line: *9h30–17h30 · Préparation en cours*.
String calendarSubtitle(Translations t, PlanningEvent event) => [
  spanOf(event) == EventSpan.oneDay ? timesText(t, event.start, event.end) : eventDatesText(t, event),
  ?statusText(t, event),
].join(' · ');

/// An *Événements* card's lines: its dates and group, then its status.
String listSubtitle(Translations t, PlanningEvent event) => [
  '${eventDatesText(t, event)} · ${event.group.isEmpty ? t.events.list.allGroups : event.group}',
  ?statusText(t, event),
].join('\n');

/// The period the calendar shows: *Samedi 21 novembre*, *Novembre 2026*, *2026*.
String periodTitle(Translations t, CalendarPeriod period) {
  final dates = t.events.dates;
  final start = period.start;
  String monthYear(DateTime day) => dates.monthYear(month: _capitalised(_month(t, day)), year: day.year);

  return switch (period.scale) {
    CalendarScale.day => _capitalised(
      dates.fullDay(weekday: dates.weekdays[start.weekday - 1], day: start.day, month: _month(t, start)),
    ),
    CalendarScale.week => () {
      final last = period.days.last;
      if (last.month == start.month) return monthYear(start);
      return dates.range(
        from: _capitalised(dates.monthsShort[start.month - 1]),
        to: '${dates.monthsShort[last.month - 1]} ${last.year}',
      );
    }(),
    CalendarScale.month => monthYear(start),
    CalendarScale.year => '${start.year}',
  };
}

/// A month's name in the year view: *Nov.*
String shortMonthText(Translations t, int month) => _capitalised(t.events.dates.monthsShort[month - 1]);
