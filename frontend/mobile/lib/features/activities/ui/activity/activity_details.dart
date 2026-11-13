import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/tokens.dart';
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

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 10,
      children: [
        FTileGroup(
          label: Text(t.activities.sheet.details),
          children: [
            for (final row in [...essentials, if (_showMore) ...more])
              .tile(
                title: Text(row.label),
                details: _RowValue(row: row),
              ),
          ],
        ),
        if (more.isNotEmpty)
          Center(
            child: FButton(
              variant: .secondary,
              size: .xs,
              mainAxisSize: MainAxisSize.min,
              onPress: () => setState(() => _showMore = !_showMore),
              child: Row(
                spacing: AppSpaces.spacing,
                children: [
                  Icon(_showMore ? FLucideIcons.chevronUp : FLucideIcons.chevronDown),
                  Text(_showMore ? t.activities.sheet.less : t.activities.sheet.more),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

/// The row's value: its text, or its tags.
class _RowValue extends StatelessWidget {
  const _RowValue({required this.row});

  final _Row row;

  @override
  Widget build(BuildContext context) {
    final value = row.value;
    if (value != null) return Text(value, textAlign: TextAlign.end);

    return Wrap(
      alignment: WrapAlignment.end,
      spacing: 4,
      runSpacing: 4,
      children: [for (final tag in row.tags) FBadge(variant: .secondary, child: Text(tag))],
    );
  }
}
