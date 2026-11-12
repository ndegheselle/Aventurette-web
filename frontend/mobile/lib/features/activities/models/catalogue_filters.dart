/// What the catalogue is filtered on, and the rules of its quick filters and of the profile.
library;

import 'package:ajil/core/range.dart';
import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/user/models/user.dart';

/// The age, the number of children and the places are the quick filters, the ones the user's
/// profile holds defaults for; the rest are only in the full sheet. A null bound is unset.
class CatalogueFilters {
  const CatalogueFilters({
    this.ageMin,
    this.ageMax,
    this.participantsMin,
    this.participantsMax,
    this.locations = const [],
    this.formats = const [],
    this.practices = const [],
    this.childrenPaces = const [],
    this.seasons = const [],
  });

  final int? ageMin;
  final int? ageMax;
  final int? participantsMin;
  final int? participantsMax;
  final List<Location> locations;
  final List<ActivityFormat> formats;
  final List<ActivityPractice> practices;
  final List<ChildrenPace> childrenPaces;
  final List<Season> seasons;

  CatalogueFilters copyWith({
    int? Function()? ageMin,
    int? Function()? ageMax,
    int? Function()? participantsMin,
    int? Function()? participantsMax,
    List<Location>? locations,
    List<ActivityFormat>? formats,
    List<ActivityPractice>? practices,
    List<ChildrenPace>? childrenPaces,
    List<Season>? seasons,
  }) {
    return CatalogueFilters(
      ageMin: ageMin != null ? ageMin() : this.ageMin,
      ageMax: ageMax != null ? ageMax() : this.ageMax,
      participantsMin: participantsMin != null ? participantsMin() : this.participantsMin,
      participantsMax: participantsMax != null ? participantsMax() : this.participantsMax,
      locations: locations ?? this.locations,
      formats: formats ?? this.formats,
      practices: practices ?? this.practices,
      childrenPaces: childrenPaces ?? this.childrenPaces,
      seasons: seasons ?? this.seasons,
    );
  }
}

// ── Quick filters ───────────────────────────────────────────────────────────────────────────

enum QuickFilter { age, participants, location }

bool isQuickFilterSet(CatalogueFilters filters, QuickFilter quick) => switch (quick) {
  QuickFilter.age => filters.ageMin != null || filters.ageMax != null,
  QuickFilter.participants => filters.participantsMin != null || filters.participantsMax != null,
  QuickFilter.location => filters.locations.isNotEmpty,
};

/// What a quick filter's pill reads: its name while unset, what is chosen once set.
sealed class QuickFilterLabel {
  const QuickFilterLabel();
}

final class UnsetFilter extends QuickFilterLabel {
  const UnsetFilter(this.quick);
  final QuickFilter quick;
}

final class RangeFilter extends QuickFilterLabel {
  const RangeFilter(this.quick, this.range);
  final QuickFilter quick;
  final RangeLabel range;
}

final class OneLocation extends QuickFilterLabel {
  const OneLocation(this.location);
  final Location location;
}

final class SomeLocations extends QuickFilterLabel {
  const SomeLocations(this.count);
  final int count;
}

QuickFilterLabel quickFilterLabel(CatalogueFilters filters, QuickFilter quick) {
  if (!isQuickFilterSet(filters, quick)) return UnsetFilter(quick);

  return switch (quick) {
    QuickFilter.age => RangeFilter(quick, RangeLabel.of(filters.ageMin, filters.ageMax)),
    QuickFilter.participants => RangeFilter(quick, RangeLabel.of(filters.participantsMin, filters.participantsMax)),
    QuickFilter.location =>
      filters.locations.length == 1 ? OneLocation(filters.locations.single) : SomeLocations(filters.locations.length),
  };
}

/// How many filters are set: a range or a list counts once, however much of it is chosen.
int activeFilterCount(CatalogueFilters filters) {
  final quick = QuickFilter.values.where((filter) => isQuickFilterSet(filters, filter)).length;
  final choices = [
    filters.formats,
    filters.practices,
    filters.childrenPaces,
    filters.seasons,
  ].where((chosen) => chosen.isNotEmpty).length;

  return quick + choices;
}

// ── The user's profile ──────────────────────────────────────────────────────────────────────

/// A profile that chose nothing has nothing to apply.
bool isProfileEmpty(FilterDefaults? defaults) =>
    defaults == null ||
    (defaults.ageMin == null &&
        defaults.ageMax == null &&
        defaults.participantsMin == null &&
        defaults.participantsMax == null &&
        defaults.locations.isEmpty);

/// The quick filters set to the profile's defaults; the others left as they are.
CatalogueFilters withProfile(CatalogueFilters filters, FilterDefaults defaults) => filters.copyWith(
  ageMin: () => defaults.ageMin,
  ageMax: () => defaults.ageMax,
  participantsMin: () => defaults.participantsMin,
  participantsMax: () => defaults.participantsMax,
  locations: [...defaults.locations],
);

/// The quick filters cleared, as turning the profile off leaves them.
CatalogueFilters withoutProfile(CatalogueFilters filters) => filters.copyWith(
  ageMin: () => null,
  ageMax: () => null,
  participantsMin: () => null,
  participantsMax: () => null,
  locations: const [],
);

/// Whether the quick filters are the profile's, so the toggle reads on. Places are compared as a
/// set: picking them in another order is the same choice. An empty profile is never applied.
bool matchesProfile(CatalogueFilters filters, FilterDefaults? defaults) {
  if (defaults == null || isProfileEmpty(defaults)) return false;

  return filters.ageMin == defaults.ageMin &&
      filters.ageMax == defaults.ageMax &&
      filters.participantsMin == defaults.participantsMin &&
      filters.participantsMax == defaults.participantsMax &&
      filters.locations.length == defaults.locations.length &&
      defaults.locations.every(filters.locations.contains);
}
