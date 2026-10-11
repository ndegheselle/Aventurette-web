import 'package:aventurette/backend/pocketbase/filters.dart';
import 'package:aventurette/core/core.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('filterGroupToPocketBase', () {
    test('is empty for an empty group', () {
      expect(filterGroupToPocketBase(const FilterGroup()), '');
    });

    test('is empty for an empty search', () {
      expect(filterGroupToPocketBase(createSearchFilter('', const ['name'])), '');
    });

    test('joins each filter to the next as the first says', () {
      final group = createSearchFilter('rope', const ['name', 'description']);

      expect(filterGroupToPocketBase(group), "name~'rope' || description~'rope'");
    });

    test('wraps a nested group in parentheses', () {
      const group = FilterGroup(
        filters: [
          Filter(key: 'state', value: 'PUBLISHED', operator: FilterOperator.equals),
          FilterGroup(
            filters: [
              Filter(key: 'name', value: 'a', combine: FilterLogical.or),
              Filter(key: 'description', value: 'a'),
            ],
          ),
        ],
      );

      expect(filterGroupToPocketBase(group), "state='PUBLISHED' && (name~'a' || description~'a')");
    });

    test('escapes a quote in a value', () {
      const group = FilterGroup(
        filters: [Filter(key: 'name', value: "l'ours")],
      );

      expect(filterGroupToPocketBase(group), "name~'l\\'ours'");
    });

    test('writes numbers and booleans bare, and a list as alternatives', () {
      const group = FilterGroup(
        filters: [
          Filter(key: 'age_min', value: 6, operator: FilterOperator.greaterOrEquals),
          Filter(key: 'indoor', value: true, operator: FilterOperator.equals),
          Filter(key: 'seasons', value: ['SUMMER', 'WINTER'], operator: FilterOperator.anyEquals),
        ],
      );

      expect(
        filterGroupToPocketBase(group),
        "age_min>=6 && indoor=true && (seasons?='SUMMER' || seasons?='WINTER')",
      );
    });
  });
}
