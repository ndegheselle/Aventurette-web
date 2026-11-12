import 'package:ajil/core/range.dart';
import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/models/catalogue_filters.dart';
import 'package:ajil/features/user/models/user.dart';
import 'package:ajil/features/user/ui/filter_defaults_fields.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/inputs/fields.dart';
import 'package:ajil/ui/inputs/pills.dart';
import 'package:ajil/ui/inputs/range_field.dart';
import 'package:ajil/ui/overlays/sheet.dart';
import 'package:ajil/ui/theme/styles.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/widgets.dart';
import 'package:remix/remix.dart';

/// A range with its unit: "8–11 ans", "Jusqu'à 6 enfants".
String quickRangeText(Translations t, QuickFilter quick, RangeLabel range) {
  final age = t.activities.filters.age;
  final children = t.activities.filters.participants;
  final isAge = quick == QuickFilter.age;

  return switch (range) {
    AnyRange() => t.activities.filters.any,
    FromRange(:final min) => isAge ? age.from(min: min) : children.from(min: min),
    UpToRange(:final max) => isAge ? age.upTo(max: max) : children.upTo(max: max),
    ExactRange(:final value) => isAge ? age.exactly(min: value) : children.exactly(min: value),
    BetweenRange(:final min, :final max) =>
      isAge ? age.between(min: min, max: max) : children.between(min: min, max: max),
  };
}

/// What a quick filter's pill reads.
String quickFilterText(Translations t, CatalogueFilters filters, QuickFilter quick) =>
    switch (quickFilterLabel(filters, quick)) {
      UnsetFilter(:final quick) => t.activities.filters.quick[quick.name]!,
      RangeFilter(:final quick, :final range) => quickRangeText(t, quick, range),
      OneLocation(:final location) => t.user.location[location.name]!,
      SomeLocations(:final count) => t.activities.filters.locations(count: count),
    };

/// Opens the filters on a copy of [applied]: *Appliquer* resolves to the edited copy, closing the
/// sheet any other way to null, leaving what is applied as it was. [only] shows one quick filter
/// alone; without it, every filter shows, with the profile toggle and *Réinitialiser*.
Future<CatalogueFilters?> showCatalogueFilters(
  BuildContext context, {
  required CatalogueFilters applied,
  required FilterDefaults? defaults,
  QuickFilter? only,
}) {
  final t = context.t.activities.filters;

  return showAppSheet<CatalogueFilters>(
    context,
    title: only == null ? t.title : t.quick[only.name]!,
    builder: (_) => _FiltersSheet(initial: applied, defaults: defaults, only: only),
  );
}

class _FiltersSheet extends StatefulWidget {
  const _FiltersSheet({required this.initial, required this.defaults, required this.only});

  final CatalogueFilters initial;
  final FilterDefaults? defaults;
  final QuickFilter? only;

  @override
  State<_FiltersSheet> createState() => _FiltersSheetState();
}

class _FiltersSheetState extends State<_FiltersSheet> {
  late CatalogueFilters _draft = widget.initial;

  void _edit(CatalogueFilters filters) => setState(() => _draft = filters);

  bool _shows(QuickFilter quick) => widget.only == null || widget.only == quick;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final all = widget.only == null;
    final defaults = widget.defaults;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 20,
      children: [
        if (all) _ProfileToggle(draft: _draft, defaults: defaults, onChanged: _edit),
        if (_shows(QuickFilter.age))
          RangeField(
            label: all ? t.activities.filters.quick['age'] : null,
            bounds: ageBounds,
            min: _draft.ageMin,
            max: _draft.ageMax,
            describe: (range) => quickRangeText(t, QuickFilter.age, range),
            onChanged: (min, max) => _edit(_draft.copyWith(ageMin: () => min, ageMax: () => max)),
          ),
        if (_shows(QuickFilter.participants))
          RangeField(
            label: all ? t.activities.filters.quick['participants'] : null,
            bounds: participantsBounds,
            min: _draft.participantsMin,
            max: _draft.participantsMax,
            describe: (range) => quickRangeText(t, QuickFilter.participants, range),
            onChanged: (min, max) => _edit(_draft.copyWith(participantsMin: () => min, participantsMax: () => max)),
          ),
        if (_shows(QuickFilter.location))
          _Choices(
            label: all ? t.activities.filters.quick['location']! : '',
            values: Location.values,
            chosen: _draft.locations,
            labelOf: (location) => t.user.location[location.name]!,
            onChanged: (locations) => _edit(_draft.copyWith(locations: locations)),
          ),
        if (all) ...[
          _Choices(
            label: t.activities.fields.format,
            values: ActivityFormat.values,
            chosen: _draft.formats,
            labelOf: (format) => t.activities.format[format.name]!,
            onChanged: (formats) => _edit(_draft.copyWith(formats: formats)),
          ),
          _Choices(
            label: t.activities.fields.practices,
            values: ActivityPractice.values,
            chosen: _draft.practices,
            labelOf: (practice) => t.activities.practice[practice.name]!,
            onChanged: (practices) => _edit(_draft.copyWith(practices: practices)),
          ),
          _Choices(
            label: t.activities.fields.childrenPace,
            values: ChildrenPace.values,
            chosen: _draft.childrenPaces,
            labelOf: (pace) => t.activities.childrenPace[pace.name]!,
            onChanged: (paces) => _edit(_draft.copyWith(childrenPaces: paces)),
          ),
          _Choices(
            label: t.activities.fields.seasons,
            values: Season.values,
            chosen: _draft.seasons,
            labelOf: (season) => t.activities.season[season.name]!,
            onChanged: (seasons) => _edit(_draft.copyWith(seasons: seasons)),
          ),
        ],
        Row(
          spacing: 8,
          children: [
            if (all)
              Expanded(
                child: RemixButton(
                  label: t.ui.actions.reset,
                  enabled: activeFilterCount(_draft) > 0,
                  style: buttonStyle(variant: ButtonVariant.outline, size: ControlSize.lg),
                  onPressed: () => _edit(const CatalogueFilters()),
                ),
              ),
            Expanded(
              child: RemixButton(
                label: t.ui.actions.apply,
                style: buttonStyle(size: ControlSize.lg),
                onPressed: () => Navigator.of(context).pop(_draft),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

/// Any number of values of one list, as pills. [label] empty shows the pills alone.
class _Choices<T extends Enum> extends StatelessWidget {
  const _Choices({
    required this.label,
    required this.values,
    required this.chosen,
    required this.labelOf,
    required this.onChanged,
  });

  final String label;
  final List<T> values;
  final List<T> chosen;
  final String Function(T value) labelOf;
  final ValueChanged<List<T>> onChanged;

  @override
  Widget build(BuildContext context) {
    final pills = MultiPills(
      values: values,
      selected: chosen.toSet(),
      labelOf: labelOf,
      onToggled: (value) => onChanged(toggled(chosen, value)),
    );
    return label.isEmpty ? pills : LabeledField(label: label, child: pills);
  }
}

/// *Appliquer mon profil*: sets the quick filters to the preferences' defaults, or clears them.
/// Reads on while they still match.
class _ProfileToggle extends StatelessWidget {
  const _ProfileToggle({required this.draft, required this.defaults, required this.onChanged});

  final CatalogueFilters draft;
  final FilterDefaults? defaults;
  final ValueChanged<CatalogueFilters> onChanged;

  @override
  Widget build(BuildContext context) {
    final t = context.t.activities.filters.profile;
    final defaults = this.defaults;
    final hasProfile = !isProfileEmpty(defaults);

    return Row(
      spacing: 12,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              StyledText(t.title, style: labelText()),
              StyledText(hasProfile ? t.help : t.empty, style: captionText()),
            ],
          ),
        ),
        RemixCheckbox(
          selected: matchesProfile(draft, defaults),
          enabled: hasProfile,
          semanticLabel: t.title,
          style: checkboxStyle(),
          onChanged: (on) {
            if (defaults == null) return;
            onChanged((on ?? false) ? withProfile(draft, defaults) : withoutProfile(draft));
          },
        ),
      ],
    );
  }
}
