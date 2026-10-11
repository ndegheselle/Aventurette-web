/// What a range reads as beside its label. `key` is a translation key, `params` its values.
class RangeLabel {
  const RangeLabel(this.key, [this.params = const {}]);

  final String key;
  final Map<String, Object?> params;
}

/// A `null` end is unset: no limit on that side.
RangeLabel rangeLabel(int? min, int? max) {
  if (min == null && max == null) return const RangeLabel('inputs.range.any');
  if (max == null) return RangeLabel('inputs.range.from', {'min': min});
  if (min == null) return RangeLabel('inputs.range.upTo', {'max': max});
  if (min == max) return RangeLabel('inputs.range.exactly', {'min': min});

  return RangeLabel('inputs.range.between', {'min': min, 'max': max});
}
