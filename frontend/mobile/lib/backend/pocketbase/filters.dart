import 'package:ajil/core/data/filters.dart';

const _operators = {
  FilterOperator.equals: '=',
  FilterOperator.contains: '~',
  FilterOperator.greaterThan: '>',
  FilterOperator.lessThan: '<',
  FilterOperator.greaterOrEquals: '>=',
  FilterOperator.lessOrEquals: '<=',
  FilterOperator.anyEquals: '?=',
};

String _logical(FilterLogical logical) => logical == FilterLogical.or ? '||' : '&&';

String _value(Object? value) => switch (value) {
  null => 'null',
  bool() || num() => '$value',
  _ => "'${'$value'.replaceAll("'", r"\'")}'",
};

/// One comparison. A list value matches when any of its values does.
String _filter(Filter filter) {
  final values = filter.value is List ? filter.value as List : [filter.value];
  final parts = [for (final value in values) '${filter.key}${_operators[filter.operator]}${_value(value)}'];

  if (parts.isEmpty) return '';
  if (parts.length == 1) return parts.single;
  return '(${parts.join(' || ')})';
}

/// The group as a PocketBase filter expression. Empty for an empty group.
String filterExpressionOf(FilterGroup group) {
  final parts = <String>[];
  FilterNode? previous;

  for (final node in group.filters) {
    final expression = switch (node) {
      final FilterGroup nested => '(${filterExpressionOf(nested)})',
      final Filter filter => _filter(filter),
    };
    if (previous != null) parts.add(_logical(previous.combine));
    parts.add(expression);
    previous = node;
  }

  return parts.join(' ');
}
