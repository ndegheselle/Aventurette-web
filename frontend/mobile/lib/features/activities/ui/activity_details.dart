import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/ui/content/surfaces.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';

/// One line of the details: what it is, and its value — a text or tags.
class _Row {
  const _Row(this.label, {this.value, this.tags = const []});

  final String label;
  final String? value;
  final List<String> tags;
}

/// The activity's details: the essentials, and the rest behind *Voir plus*.
class ActivityDetails extends StatefulWidget {
  const ActivityDetails({super.key, required this.activity});

  final ActivityData activity;

  @override
  State<ActivityDetails> createState() => _ActivityDetailsState();
}

class _ActivityDetailsState extends State<ActivityDetails> {
  var _showMore = false;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final fields = t.activities.fields;
    final activity = widget.activity;
    final timing = timingOf(activity);
    final minutes = t.activities.minutes;

    final essentials = [
      _Row(fields.preparationTime, value: minutes(minutes: timing.preparation)),
      _Row(fields.playTime, value: minutes(minutes: timing.play)),
      _Row(fields.totalTime, value: minutes(minutes: timing.total)),
    ];

    final format = activity.classification.format;
    final rule = activity.imaginary.rule;
    final pace = activity.audience.childrenPace;
    final effort = activity.supervision.hostEffort;
    final more = [
      if (format != null) _Row(fields.format, value: t.activities.format[format.name]),
      if (activity.classification.practices.isNotEmpty)
        _Row(
          fields.practices,
          tags: [for (final p in activity.classification.practices) t.activities.practice[p.name]!],
        ),
      if (activity.classification.themes.isNotEmpty)
        _Row(fields.themes, tags: [for (final tag in activity.classification.themes) tag.name]),
      if (rule != null) _Row(fields.imaginaryRule, value: t.activities.imaginaryRule[rule.name]),
      if (activity.imaginary.universes.isNotEmpty)
        _Row(fields.universes, tags: [for (final tag in activity.imaginary.universes) tag.name]),
      if (pace != null) _Row(fields.childrenPace, value: t.activities.childrenPace[pace.name]),
      if (effort != null) _Row(fields.hostEffort, value: t.activities.hostEffort[effort.name]),
      if (activity.supervision.hostsRequired > 0) _Row(fields.hosts, value: '${activity.supervision.hostsRequired}'),
      if (activity.supervision.crossSupervision) _Row(fields.crossSupervision, value: fields.yes),
      if (activity.place.locations.isNotEmpty)
        _Row(fields.locations, tags: [for (final l in activity.place.locations) t.user.location[l.name]!]),
      if (activity.place.seasons.isNotEmpty)
        _Row(fields.seasons, tags: [for (final s in activity.place.seasons) t.activities.season[s.name]!]),
      if (activity.pedagogy.goals.isNotEmpty)
        _Row(fields.goals, tags: [for (final tag in activity.pedagogy.goals) tag.name]),
      if (activity.pedagogy.idealFor.isNotEmpty)
        _Row(fields.idealFor, tags: [for (final tag in activity.pedagogy.idealFor) tag.name]),
    ];

    final rows = [...essentials, if (_showMore) ...more];

    return Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: 10,
        children: [
          Text(t.activities.sheet.details, style: context.headingText),
          for (final row in rows) _DetailRow(row: row),
          if (more.isNotEmpty)
            Center(
              child: FButton(
                variant: .ghost,
                size: .sm,
                mainAxisSize: MainAxisSize.min,
                onPress: () => setState(() => _showMore = !_showMore),
                child: Text(_showMore ? t.activities.sheet.less : t.activities.sheet.more),
              ),
            ),
        ],
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.row});

  final _Row row;

  @override
  Widget build(BuildContext context) {
    final value = row.value;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 12,
      children: [
        Expanded(child: Text(row.label, style: context.captionText)),
        Flexible(
          child: value != null
              ? Text(value, style: context.bodyText, textAlign: TextAlign.end)
              : Wrap(
                  alignment: WrapAlignment.end,
                  spacing: 4,
                  runSpacing: 4,
                  children: [for (final tag in row.tags) Tag(tag)],
                ),
        ),
      ],
    );
  }
}
