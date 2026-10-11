import 'package:aventurette/app/i18n.dart';
import 'package:aventurette/features/activities/components/activity_notices.dart';
import 'package:aventurette/features/activities/components/step_summary.dart';
import 'package:aventurette/features/activities/composables/use_activity.dart';
import 'package:aventurette/features/activities/model/activity.dart';
import 'package:aventurette/features/activities/model/material.dart';
import 'package:aventurette/features/activities/model/workshop.dart';
import 'package:aventurette/features/activities/routes.dart';
import 'package:aventurette/ui/layout/container.dart';
import 'package:aventurette/ui/layout/html_text.dart';
import 'package:aventurette/ui/layout/panel.dart';
import 'package:aventurette/ui/layout/section_title.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class ActivityPage extends StatefulWidget {
  const ActivityPage({super.key, required this.id});

  final String id;

  @override
  State<ActivityPage> createState() => _ActivityPageState();
}

class _ActivityPageState extends State<ActivityPage> {
  final _source = UseActivity();

  @override
  void initState() {
    super.initState();
    _source.load(widget.id);
  }

  // The router reuses the page when only the id changes.
  @override
  void didUpdateWidget(ActivityPage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.id != widget.id) _source.load(widget.id);
  }

  @override
  void dispose() {
    _source.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: _source,
      builder: (context, _) {
        final activity = _source.activity;

        return Column(
          children: [
            _Actions(activity: activity),
            Expanded(
              child: activity == null
                  ? Center(
                      child: _source.isLoading
                          ? const CircularProgressIndicator()
                          : Text(context.t('data.noData')),
                    )
                  : _Details(activity: activity, source: _source),
            ),
          ],
        );
      },
    );
  }
}

class _Actions extends StatelessWidget {
  const _Actions({required this.activity});

  final ActivityData? activity;

  @override
  Widget build(BuildContext context) {
    final current = activity;

    return Padding(
      padding: const EdgeInsets.all(4),
      child: Row(
        spacing: 4,
        children: [
          TextButton.icon(
            icon: const Icon(LucideIcons.arrowLeft),
            label: Text(context.t('actions.back')),
            onPressed: () => context.goNamed(routesNames.all),
          ),
          if (current != null) ActivityNotices(safety: current.safety.instructions),
          const Spacer(),
          // XXX : favourites and the planning do not exist yet.
          IconButton(
            tooltip: context.t('activities.actions.favorite'),
            icon: const Icon(LucideIcons.heart),
            onPressed: null,
          ),
          IconButton(
            tooltip: context.t('activities.actions.addToPlanning'),
            icon: const Icon(LucideIcons.calendar),
            onPressed: null,
          ),
          FilledButton.icon(
            icon: const Icon(LucideIcons.monitorPlay),
            label: Text(context.t('activities.actions.start')),
            onPressed: current == null
                ? null
                : () => context.goNamed(routesNames.play, pathParameters: {'id': current.id}),
          ),
        ],
      ),
    );
  }
}

class _Details extends StatelessWidget {
  const _Details({required this.activity, required this.source});

  final ActivityData activity;
  final UseActivity source;

  @override
  Widget build(BuildContext context) {
    final resources = source.resources;

    return PageContainer(
      children: [
        LayoutBuilder(
          builder: (context, constraints) {
            final panels = [_Header(activity: activity), _Facts(activity: activity, source: source)];
            if (constraints.maxWidth < 700) return Column(spacing: 8, children: panels);

            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              spacing: 8,
              children: [for (final panel in panels) Expanded(child: panel)],
            );
          },
        ),
        if (activity.materials.isNotEmpty) _Materials(materials: activity.materials),
        if (resources.isNotEmpty)
          Panel(
            children: [
              SectionTitle(context.t('activities.steps.fields.resources.title'), icon: LucideIcons.fileText),
              Wrap(
                spacing: 8,
                children: [for (final resource in resources) Chip(label: Text(resource.name))],
              ),
            ],
          ),
        Panel(
          children: [
            SectionTitle(context.t('activities.description'), icon: LucideIcons.scrollText),
            HtmlText(activity.description),
          ],
        ),
        if (activity.workshops.isNotEmpty) _Workshops(workshops: activity.workshops),
        Panel(
          children: [
            SectionTitle(context.t('activities.steps.title'), icon: LucideIcons.listOrdered),
            for (final (index, step) in activity.steps.indexed) ...[
              if (index > 0) const Divider(),
              StepSummary(index: index, step: step),
            ],
          ],
        ),
      ],
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.activity});

  final ActivityData activity;

  @override
  Widget build(BuildContext context) {
    final format = activity.classification.format;

    return Panel(
      children: [
        Text(activity.name, style: Theme.of(context).textTheme.headlineSmall),
        Wrap(
          spacing: 4,
          children: [
            if (format != null) Chip(label: Text(context.t('activities.format.${format.wire}'))),
            for (final theme in activity.classification.themes) Chip(label: Text(theme.name)),
          ],
        ),
      ],
    );
  }
}

class _Facts extends StatelessWidget {
  const _Facts({required this.activity, required this.source});

  final ActivityData activity;
  final UseActivity source;

  @override
  Widget build(BuildContext context) {
    final ageLabel = source.ageLabel;
    final participantsLabel = source.participantsLabel;
    final timing = source.timing;
    final place = activity.place;
    final childrenPace = activity.audience.childrenPace;
    final hostEffort = activity.supervision.hostEffort;
    final hostsRequired = activity.supervision.hostsRequired;
    final idealFor = activity.pedagogy.idealFor;

    return Panel(
      children: [
        _Fact(
          icon: LucideIcons.cake,
          label: context.t('activities.fields.age'),
          value: Text(context.t(ageLabel.key, ageLabel.params)),
        ),
        _Fact(
          icon: LucideIcons.users,
          label: context.t('activities.fields.participants'),
          value: Text(context.t(participantsLabel.key, participantsLabel.params)),
        ),
        _Fact(
          icon: LucideIcons.hourglass,
          label: context.t('activities.fields.preparationTime'),
          value: Text(context.t('activities.minutes', {'minutes': timing.preparation})),
        ),
        _Fact(
          icon: LucideIcons.clock,
          label: context.t('activities.fields.playTime'),
          value: Text(context.t('activities.minutes', {'minutes': timing.play})),
        ),
        _Fact(
          icon: LucideIcons.mapPin,
          label: context.t('activities.families.place'),
          value: Wrap(
            spacing: 4,
            children: [
              if (place.indoor) Chip(label: Text(context.t('activities.fields.indoor'))),
              if (place.outdoor) Chip(label: Text(context.t('activities.fields.outdoor'))),
            ],
          ),
        ),
        if (childrenPace != null)
          _Fact(
            icon: LucideIcons.gauge,
            label: context.t('activities.fields.childrenPace'),
            value: Text(context.t('activities.childrenPace.${childrenPace.wire}')),
          ),
        if (hostEffort != null)
          _Fact(
            icon: LucideIcons.zap,
            label: context.t('activities.fields.hostEffort'),
            value: Text(context.t('activities.hostEffort.${hostEffort.wire}')),
          ),
        if (hostsRequired > 0)
          _Fact(
            icon: LucideIcons.userCheck,
            label: context.t('activities.fields.hosts'),
            value: Text('$hostsRequired'),
          ),
        if (idealFor.isNotEmpty)
          _Fact(
            icon: LucideIcons.sparkles,
            label: context.t('activities.tagType.IDEAL_FOR'),
            value: Wrap(spacing: 4, children: [for (final tag in idealFor) Chip(label: Text(tag.name))]),
          ),
        if (place.conditions.isNotEmpty) ...[
          SectionTitle(context.t('activities.fields.conditions'), icon: LucideIcons.cloudSun),
          HtmlText(place.conditions),
        ],
      ],
    );
  }
}

class _Fact extends StatelessWidget {
  const _Fact({required this.icon, required this.label, required this.value});

  final IconData icon;
  final String label;
  final Widget value;

  @override
  Widget build(BuildContext context) {
    final muted = Theme.of(context).textTheme.bodySmall;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      spacing: 8,
      children: [
        Icon(icon, size: 16),
        Expanded(child: Text(label, style: muted)),
        Flexible(child: value),
      ],
    );
  }
}

class _Materials extends StatelessWidget {
  const _Materials({required this.materials});

  final List<ActivityMaterialData> materials;

  @override
  Widget build(BuildContext context) {
    return Panel(
      children: [
        SectionTitle(context.t('activities.materials.title'), icon: LucideIcons.packageOpen),
        for (final material in materials)
          ListTile(
            dense: true,
            contentPadding: EdgeInsets.zero,
            title: Text(material.name),
            subtitle: material.quantity.isEmpty ? null : Text(material.quantity),
          ),
      ],
    );
  }
}

class _Workshops extends StatelessWidget {
  const _Workshops({required this.workshops});

  final List<ActivityWorkshopData> workshops;

  @override
  Widget build(BuildContext context) {
    return Panel(
      children: [
        SectionTitle(context.t('activities.workshops.title'), icon: LucideIcons.users),
        for (final workshop in workshops)
          ListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(workshop.name),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [if (workshop.theme.isNotEmpty) Text(workshop.theme), HtmlText(workshop.challenges)],
            ),
            trailing: workshop.adultsRequired > 0
                ? Chip(
                    label: Text(context.t('activities.workshops.adults', {'count': workshop.adultsRequired})),
                  )
                : null,
          ),
      ],
    );
  }
}
