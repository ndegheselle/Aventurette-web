import 'package:ajil/core/range.dart';
import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/models/catalogue_filters.dart';
import 'package:ajil/features/user/models/user.dart';
import 'package:flutter_test/flutter_test.dart';

const profile = FilterDefaults(ageMin: 6, ageMax: 11, locations: [Location.park, Location.forest]);

void main() {
  group('a quick filter', () {
    test('reads as its name while unset', () {
      expect(quickFilterLabel(const CatalogueFilters(), QuickFilter.age), isA<UnsetFilter>());
    });

    test('reads as its range once set', () {
      final label = quickFilterLabel(const CatalogueFilters(ageMin: 6), QuickFilter.age);
      expect(label, isA<RangeFilter>().having((l) => l.range, 'range', isA<FromRange>()));
    });

    test('reads as the place when one is chosen, and as a count for several', () {
      expect(
        quickFilterLabel(const CatalogueFilters(locations: [Location.lake]), QuickFilter.location),
        isA<OneLocation>(),
      );
      expect(
        quickFilterLabel(const CatalogueFilters(locations: [Location.lake, Location.pool]), QuickFilter.location),
        isA<SomeLocations>().having((l) => l.count, 'count', 2),
      );
    });
  });

  test('counts a range or a list once, however much of it is chosen', () {
    const filters = CatalogueFilters(
      ageMin: 3,
      ageMax: 6,
      locations: [Location.park, Location.lake],
      seasons: [Season.summer, Season.winter],
    );
    expect(activeFilterCount(filters), 3);
  });

  group('the profile', () {
    test('sets the quick filters and leaves the others as they are', () {
      final filters = withProfile(const CatalogueFilters(seasons: [Season.summer]), profile);

      expect((filters.ageMin, filters.ageMax), (6, 11));
      expect(filters.locations, [Location.park, Location.forest]);
      expect(filters.seasons, [Season.summer]);
    });

    test('reads on while the quick filters match it, places compared as a set', () {
      const reordered = CatalogueFilters(ageMin: 6, ageMax: 11, locations: [Location.forest, Location.park]);

      expect(matchesProfile(reordered, profile), isTrue);
      expect(matchesProfile(reordered.copyWith(ageMax: () => 12), profile), isFalse);
    });

    test('is never applied when empty', () {
      expect(matchesProfile(const CatalogueFilters(), const FilterDefaults()), isFalse);
    });

    test('turned off clears the quick filters only', () {
      final filters = withoutProfile(withProfile(const CatalogueFilters(formats: [ActivityFormat.workshop]), profile));

      expect(isQuickFilterSet(filters, QuickFilter.age), isFalse);
      expect(filters.locations, isEmpty);
      expect(filters.formats, [ActivityFormat.workshop]);
    });
  });
}
