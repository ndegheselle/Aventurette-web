import 'package:ajil/core/range.dart';
import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/models/catalogue_filters.dart';
import 'package:ajil/features/user/models/user.dart';
import 'package:ajil/features/user/ui/me/prefs/filter_defaults_fields.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/inputs/fields.dart';
import 'package:ajil/ui/inputs/pills.dart';
import 'package:ajil/ui/inputs/range_field.dart';
import 'package:ajil/ui/overlays/sheet.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';

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
  // Shared by the scrolling filters and the buttons pinned under them, which the sheet builds apart.
  final draft = ValueNotifier(applied);
  void edit(CatalogueFilters filters) => draft.value = filters;

  return showAppSheet<CatalogueFilters>(
    context,
    title: only == null ? t.title : t.quick[only.name]!,
    builder: (_) => ValueListenableBuilder(
      valueListenable: draft,
      builder: (_, value, _) => _Filters(draft: value, defaults: defaults, only: only, onChanged: edit),
    ),
    actionsBuilder: (sheetContext) => ValueListenableBuilder(
      valueListenable: draft,
      builder: (_, value, _) => _FiltersActions(
        draft: value,
        canReset: only == null,
        onChanged: edit,
        onApply: () => Navigator.of(sheetContext).pop(value),
      ),
    ),
  ).whenComplete(draft.dispose);
}

class _Filters extends StatelessWidget {
  const _Filters({required this.draft, required this.defaults, required this.only, required this.onChanged});

  final CatalogueFilters draft;
  final FilterDefaults? defaults;
  final QuickFilter? only;
  final ValueChanged<CatalogueFilters> onChanged;

  bool _shows(QuickFilter quick) => only == null || only == quick;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final all = only == null;
    final defaults = this.defaults;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 20,
      children: [
        if (all) _ProfileToggle(draft: draft, defaults: defaults, onChanged: onChanged),
        if (_shows(QuickFilter.age))
          RangeField(
            label: all ? t.activities.filters.quick['age'] : null,
            bounds: ageBounds,
            min: draft.ageMin,
            max: draft.ageMax,
            describe: (range) => quickRangeText(t, QuickFilter.age, range),
            onChanged: (min, max) => onChanged(draft.copyWith(ageMin: () => min, ageMax: () => max)),
          ),
        if (_shows(QuickFilter.participants))
          RangeField(
            label: all ? t.activities.filters.quick['participants'] : null,
            bounds: participantsBounds,
            min: draft.participantsMin,
            max: draft.participantsMax,
            describe: (range) => quickRangeText(t, QuickFilter.participants, range),
            onChanged: (min, max) => onChanged(draft.copyWith(participantsMin: () => min, participantsMax: () => max)),
          ),
        if (_shows(QuickFilter.location))
          _Choices(
            label: all ? t.activities.filters.quick['location']! : '',
            values: Location.values,
            chosen: draft.locations,
            labelOf: (location) => t.user.location[location.name]!,
            onChanged: (locations) => onChanged(draft.copyWith(locations: locations)),
          ),
        if (all) ...[
          _Choices(
            label: t.activities.fields.format,
            values: ActivityFormat.values,
            chosen: draft.formats,
            labelOf: (format) => t.activities.format[format.name]!,
            onChanged: (formats) => onChanged(draft.copyWith(formats: formats)),
          ),
          _Choices(
            label: t.activities.fields.practices,
            values: ActivityPractice.values,
            chosen: draft.practices,
            labelOf: (practice) => t.activities.practice[practice.name]!,
            onChanged: (practices) => onChanged(draft.copyWith(practices: practices)),
          ),
          _Choices(
            label: t.activities.fields.childrenPace,
            values: ChildrenPace.values,
            chosen: draft.childrenPaces,
            labelOf: (pace) => t.activities.childrenPace[pace.name]!,
            onChanged: (paces) => onChanged(draft.copyWith(childrenPaces: paces)),
          ),
          _Choices(
            label: t.activities.fields.seasons,
            values: Season.values,
            chosen: draft.seasons,
            labelOf: (season) => t.activities.season[season.name]!,
            onChanged: (seasons) => onChanged(draft.copyWith(seasons: seasons)),
          ),
        ],
      ],
    );
  }
}

/// *Appliquer*, and *Réinitialiser* beside it when every filter shows.
class _FiltersActions extends StatelessWidget {
  const _FiltersActions({
    required this.draft,
    required this.canReset,
    required this.onChanged,
    required this.onApply,
  });

  final CatalogueFilters draft;
  final bool canReset;
  final ValueChanged<CatalogueFilters> onChanged;
  final VoidCallback onApply;

  @override
  Widget build(BuildContext context) {
    final t = context.t.ui.actions;

    return Row(
      spacing: 8,
      children: [
        if (canReset)
          Expanded(
            child: FButton(
              variant: .outline,
              size: .lg,
              onPress: activeFilterCount(draft) > 0 ? () => onChanged(const CatalogueFilters()) : null,
              child: Text(t.reset),
            ),
          ),
        Expanded(
          child: FButton(size: .lg, onPress: onApply, child: Text(t.apply)),
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

    return FTile(
      title: Text(t.title, style: context.labelText),
      subtitle: Text(hasProfile ? t.help : t.empty, style: context.captionText),
      suffix: FSwitch(
        value: matchesProfile(draft, defaults),
        enabled: hasProfile,
        semanticsLabel: t.title,
        onChange: (on) {
          if (defaults == null) return;
          onChanged(on ? withProfile(draft, defaults) : withoutProfile(draft));
        },
      ),
    );
  }
}
