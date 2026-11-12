/// A two-ended range whose ends may be unset: an age span, a head count. The rules a range
/// field follows, apart from the widget that draws it.
library;

/// The bounds the two thumbs move within.
class RangeBounds {
  const RangeBounds({required this.floor, required this.ceiling});

  final int floor;
  final int ceiling;
}

/// An unset end sits at its edge, so an empty range spans the whole track.
int lowOf(RangeBounds bounds, int? min) => min ?? bounds.floor;
int highOf(RangeBounds bounds, int? max) => max ?? bounds.ceiling;

/// An end back at its edge bounds nothing, so it reads as unset, as it started.
int? lowValue(RangeBounds bounds, int value) => value <= bounds.floor ? null : value;
int? highValue(RangeBounds bounds, int value) => value >= bounds.ceiling ? null : value;

/// What a range reads as beside its label.
sealed class RangeLabel {
  const RangeLabel();

  factory RangeLabel.of(int? min, int? max) {
    if (min == null && max == null) return const AnyRange();
    if (max == null) return FromRange(min!);
    if (min == null) return UpToRange(max);
    if (min == max) return ExactRange(min);
    return BetweenRange(min, max);
  }
}

final class AnyRange extends RangeLabel {
  const AnyRange();
}

final class FromRange extends RangeLabel {
  const FromRange(this.min);
  final int min;
}

final class UpToRange extends RangeLabel {
  const UpToRange(this.max);
  final int max;
}

final class ExactRange extends RangeLabel {
  const ExactRange(this.value);
  final int value;
}

final class BetweenRange extends RangeLabel {
  const BetweenRange(this.min, this.max);
  final int min;
  final int max;
}
