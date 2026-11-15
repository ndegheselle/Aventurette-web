import 'package:ajil/features/planning/day_templates/models/day_template.dart';
import 'package:ajil/features/planning/day_templates/routes.dart';
import 'package:ajil/features/planning/day_templates/state/day_templates.dart';
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

/// The *Journées types* (B03): Ajil's templates, the structure's or the user's own, searched.
class DayTemplatesView extends ConsumerWidget {
  const DayTemplatesView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t.dayTemplates;
    final query = ref.watch(dayTemplatesQueryProvider);
    final notifier = ref.read(dayTemplatesQueryProvider.notifier);

    return ListView(
      padding: const EdgeInsets.only(bottom: AppSpaces.page),
      children: [
        ChoicePills(
          values: TemplateSource.values,
          selected: query.source,
          labelOf: (source) => t.sources[source.name]!,
          onSelected: notifier.show,
        ),
        const SizedBox(height: AppSpaces.spacing),
        SearchField(label: t.searchLabel, hintText: t.searchHint, onSearch: notifier.search),
        const SizedBox(height: AppSpaces.spacing),
        AsyncView(
          value: ref.watch(dayTemplatesProvider),
          onRetry: () => ref.invalidate(dayTemplatesProvider),
          data: (templates) => _TemplateList(templates: templates),
        ),
        const SizedBox(height: AppSpaces.spacing),
        HintBox(t.hint),
        const SizedBox(height: AppSpaces.spacing),
        const CreateEventButton(),
      ],
    );
  }
}

class _TemplateList extends StatelessWidget {
  const _TemplateList({required this.templates});

  final List<DayTemplate> templates;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    if (templates.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: AppSpaces.page),
        child: Text(t.dayTemplates.empty, style: context.captionText, textAlign: TextAlign.center),
      );
    }

    return Column(
      spacing: AppSpaces.spacing,
      children: [
        for (final template in templates)
          LinkCard(
            title: _titleOf(t, template),
            subtitle: template.summary.isEmpty ? null : template.summary,
            onTap: () => context.push(DayTemplatesRoutes.template(template.id)),
          ),
      ],
    );
  }
}

/// *Sortie scouts · 9h30–17h30*, or the name alone when the template sets no times.
String _titleOf(Translations t, DayTemplate template) {
  final start = template.startMinutes;
  final end = template.endMinutes;
  if (start == null || end == null) return template.name;

  final from = clockOf(start);
  final to = clockOf(end);
  final times = t.events.dates.times(
    from: clockText(t, from.hours, from.minutes),
    to: clockText(t, to.hours, to.minutes),
  );
  return '${template.name} · $times';
}
