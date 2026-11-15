import 'package:ajil/features/planning/day_templates/ui/day_templates_view.dart';
import 'package:ajil/features/planning/events/ui/calendar_view.dart';
import 'package:ajil/features/planning/events/ui/events_view.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';

/// The Planning tab's three views (B01, B02, B03), as segments at the top.
enum PlanningSegment { calendar, events, templates }

/// The Planning tab: the calendar, the events and the day templates.
class PlanningPage extends StatelessWidget {
  const PlanningPage({super.key});

  @override
  Widget build(BuildContext context) {
    final t = context.t.events;

    Widget body(PlanningSegment segment) => switch (segment) {
      PlanningSegment.calendar => const CalendarView(),
      PlanningSegment.events => const EventsView(),
      PlanningSegment.templates => const DayTemplatesView(),
    };

    return AppPage(
      header: TabHeader(title: t.screens.tab),
      body: Padding(
        padding: const EdgeInsets.fromLTRB(AppSpaces.page, AppSpaces.spacing, AppSpaces.page, 0),
        child: FTabs(
          expands: true,
          scrollable: true,
          children: [
            for (final segment in PlanningSegment.values)
              .entry(label: Text(t.segments[segment.name]!), child: body(segment)),
          ],
        ),
      ),
    );
  }
}
