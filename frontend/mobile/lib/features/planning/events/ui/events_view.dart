import 'package:ajil/features/planning/events/models/event.dart';
import 'package:ajil/features/planning/events/routes.dart';
import 'package:ajil/features/planning/events/state/planning.dart';
import 'package:ajil/features/planning/events/ui/create_event_button.dart';
import 'package:ajil/features/planning/events/ui/event_text.dart';
import 'package:ajil/ui/async/async_view.dart';
import 'package:ajil/ui/content/surfaces.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/inputs/fields.dart';
import 'package:ajil/ui/inputs/pills.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

/// The *Événements* (B02): the user's events, or those shared with them, searched by name, each
/// with its dates and status.
class EventsView extends ConsumerWidget {
  const EventsView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t.events;
    final query = ref.watch(eventsQueryProvider);
    final notifier = ref.read(eventsQueryProvider.notifier);

    return ListView(
      padding: const EdgeInsets.only(bottom: AppSpaces.page),
      children: [
        SearchField(label: t.list.searchLabel, hintText: t.list.searchHint, onSearch: notifier.search),
        const SizedBox(height: AppSpaces.spacing),
        ChoicePills(
          values: EventsSegment.values,
          selected: query.segment,
          labelOf: (segment) => t.list.segments[segment.name]!,
          onSelected: notifier.show,
        ),
        const SizedBox(height: AppSpaces.spacing),
        AsyncView(
          value: ref.watch(eventsListProvider),
          onRetry: () => ref.invalidate(eventsListProvider),
          data: (events) => _EventList(events: events),
        ),
        const SizedBox(height: AppSpaces.spacing),
        const CreateEventButton(),
      ],
    );
  }
}

class _EventList extends StatelessWidget {
  const _EventList({required this.events});

  final List<PlanningEvent> events;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    if (events.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: AppSpaces.page),
        child: Text(t.events.list.empty, style: context.captionText, textAlign: TextAlign.center),
      );
    }

    return Column(
      spacing: AppSpaces.spacing,
      children: [
        for (final event in events)
          LinkCard(
            title: event.name,
            subtitle: listSubtitle(t, event),
            onTap: () => context.push(EventsRoutes.event(event.id)),
          ),
      ],
    );
  }
}
