/// A choice the backend stores as a string.
abstract interface class WireEnum {
  String get wire;
}

/// The choice stored as `wire`. The backend stores none as the empty string, and may hold a
/// value this app does not know yet: both read as null.
T? choiceOf<T extends WireEnum>(List<T> values, Object? wire) {
  for (final value in values) {
    if (value.wire == wire) return value;
  }
  return null;
}

/// Every known choice among `wires`, in order.
List<T> choicesOf<T extends WireEnum>(List<T> values, Object? wires) {
  if (wires is! List) return const [];
  return [for (final wire in wires) ?choiceOf(values, wire)];
}
