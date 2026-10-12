enum FilterOperator { equals, contains, greaterThan, lessThan, greaterOrEquals, lessOrEquals, anyEquals }

enum FilterLogical { or, and }

sealed class FilterNode {
  const FilterNode(this.combine);

  /// Joins this node to whatever follows it in its group.
  final FilterLogical combine;
}

/// One field comparison.
class Filter extends FilterNode {
  const Filter({
    required this.key,
    required this.value,
    this.operator = FilterOperator.contains,
    FilterLogical combine = FilterLogical.and,
  }) : super(combine);

  final String key;
  final Object? value;
  final FilterOperator operator;
}

/// Filters and nested groups, combined as each says.
class FilterGroup extends FilterNode {
  const FilterGroup({this.filters = const [], FilterLogical combine = FilterLogical.and}) : super(combine);

  final List<FilterNode> filters;
}

/// One OR group matching `search` against every key. Empty for an empty search.
FilterGroup createSearchFilter(String search, List<String> keys) {
  if (search.isEmpty) return const FilterGroup();

  return FilterGroup(
    filters: [for (final key in keys) Filter(key: key, value: search, combine: FilterLogical.or)],
  );
}
