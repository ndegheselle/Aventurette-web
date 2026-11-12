/// The backend-neutral filter vocabulary: what a list asks for, without naming the backend.
library;

enum FilterOperator {
  equals,
  contains,
  greaterThan,
  lessThan,

  /// Inclusive bounds. A range overlaps another when its ends touch, so `>` would drop it.
  greaterOrEquals,
  lessOrEquals,

  /// One value of a list field equals the value.
  anyEquals,
}

enum FilterLogical { and, or }

/// A filter or a group of them. `combine` joins it to whatever follows it in its group.
sealed class FilterNode {
  const FilterNode();

  FilterLogical get combine;
}

/// One field comparison. A list [value] matches when any of its values does.
///
/// [key] is the column as the backend stores it: Dart has no way to type it against an entity,
/// and only `api/` builds filters, so it is the one place that knows the columns.
final class Filter extends FilterNode {
  const Filter(this.key, this.value, {this.operator = FilterOperator.contains, this.combine = FilterLogical.and});

  final String key;
  final Object? value;
  final FilterOperator operator;
  @override
  final FilterLogical combine;
}

/// Filters and nested groups, combined as each one's `combine` says.
final class FilterGroup extends FilterNode {
  const FilterGroup(this.filters, {this.combine = FilterLogical.and});

  final List<FilterNode> filters;
  @override
  final FilterLogical combine;
}

/// One OR group matching [search] against every key. Empty for an empty search.
FilterGroup searchFilter(String search, List<String> keys) {
  if (search.isEmpty) return const FilterGroup([]);

  return FilterGroup([for (final key in keys) Filter(key, search, combine: FilterLogical.or)]);
}
