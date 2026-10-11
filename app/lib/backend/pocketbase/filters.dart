import 'package:aventurette/core/core.dart';

const _operators = {
  FilterOperator.equals: '=',
  FilterOperator.contains: '~',
  FilterOperator.greaterThan: '>',
  FilterOperator.lessThan: '<',
  FilterOperator.greaterOrEquals: '>=',
  FilterOperator.lessOrEquals: '<=',
  FilterOperator.anyEquals: '?=',
};

String _valueToString(Object? value) {
  if (value == null) return 'null';
  if (value is bool || value is num) return value.toString();
  return "'${value.toString().replaceAll("'", "\\'")}'";
}

String _logicalToString(FilterLogical logical) => logical == FilterLogical.or ? '||' : '&&';

String filterToPocketBase(Filter filter) {
  final values = filter.value is List ? filter.value as List : [filter.value];
  final operator = _operators[filter.operator];
  final parts = [for (final value in values) '${filter.key}$operator${_valueToString(value)}'];

  if (parts.isEmpty) return '';
  if (parts.length == 1) return parts.first;
  return '(${parts.join(' || ')})';
}

String filterGroupToPocketBase(FilterGroup group) {
  final parts = <String>[];
  FilterNode? previous;

  for (final node in group.filters) {
    final expression = switch (node) {
      FilterGroup() => '(${filterGroupToPocketBase(node)})',
      Filter() => filterToPocketBase(node),
    };

    if (previous != null) parts.add(_logicalToString(previous.combine));
    parts.add(expression);
    previous = node;
  }

  return parts.join(' ');
}
