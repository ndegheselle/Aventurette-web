import 'package:ajil/features/planning/models/period.dart';
import 'package:ajil/features/planning/state/planning.dart';
import 'package:ajil/features/planning/ui/planning_text.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';

/// The period shown, which opens a calendar to pick another, and beside it the range to show by.
class PeriodBar extends ConsumerWidget {
  const PeriodBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final view = ref.watch(planningProvider);

    return Row(
      spacing: AppSpaces.spacing,
      children: [
        Expanded(child: _PeriodButton(view: view)),
        _RangeMenu(range: view.range),
      ],
    );
  }
}

/// forui's calendars count days as UTC midnights; the app, as local ones.
DateTime _toCalendarDate(DateTime day) => DateTime.utc(day.year, day.month, day.day);

DateTime _fromCalendarDate(DateTime date) => DateTime(date.year, date.month, date.day);

/// The period written out. Its calendar shows the period selected; a day tapped picks the
/// period holding it, of the same range.
class _PeriodButton extends ConsumerWidget {
  const _PeriodButton({required this.view});

  final PlanningView view;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final period = view.period;
    final from = _toCalendarDate(period.from);
    final last = _toCalendarDate(period.lastDay);

    return FPopover(
      popoverBuilder: (context, controller) => FCalendar.grid(
        control: FGridCalendarControl(initial: from, today: _toCalendarDate(ref.read(todayProvider))),
        // The selection follows the period: a tap is read by onDayPress, not by forui's range.
        selectionControl: view.range == TimeRange.day
            ? .liftedSingle(value: from, toggleable: false, onChange: (_) {})
            : .liftedRange(value: (from, last), onChange: (_) {}),
        onDayPress: (date) {
          ref.read(planningProvider.notifier).select(_fromCalendarDate(date));
          controller.hide();
        },
      ),
      builder: (context, controller, _) => FButton(
        variant: .outline,
        prefix: const Icon(FLucideIcons.calendarDays),
        onPress: controller.toggle,
        child: Text(periodTitle(context.t, view.range, period)),
      ),
    );
  }
}

/// The ranges the planning shows by, in a menu opened from an icon.
class _RangeMenu extends ConsumerWidget {
  const _RangeMenu({required this.range});

  final TimeRange range;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t.planning;

    return FPopoverMenu(
      menuAnchor: .topRight,
      childAnchor: .bottomRight,
      menuBuilder: (context, controller, _) => [
        FItemGroup(
          children: [
            for (final value in TimeRange.values)
              FItem(
                title: Text(t.ranges[value.name]!),
                selected: value == range,
                suffix: value == range ? const Icon(FLucideIcons.check) : null,
                onPress: () {
                  ref.read(planningProvider.notifier).show(value);
                  controller.hide();
                },
              ),
          ],
        ),
      ],
      builder: (context, controller, _) => FButton.icon(
        semanticsLabel: t.range,
        onPress: controller.toggle,
        child: const Icon(FLucideIcons.calendarCog),
      ),
    );
  }
}
