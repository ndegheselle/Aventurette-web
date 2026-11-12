import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/inputs/fields.dart';
import 'package:ajil/core/range.dart';
import 'package:ajil/ui/theme/styles.dart';
import 'package:flutter/widgets.dart';
import 'package:remix/remix.dart';

/// The generic wording of a range: "De 3 à 6". A feature with a unit writes its own.
String rangeText(Translations t, RangeLabel label) => switch (label) {
  AnyRange() => t.ui.range.any,
  FromRange(:final min) => t.ui.range.from(min: min),
  UpToRange(:final max) => t.ui.range.upTo(max: max),
  ExactRange(:final value) => t.ui.range.exactly(min: value),
  BetweenRange(:final min, :final max) => t.ui.range.between(min: min, max: max),
};

/// Two thumbs on one track, each end unset while it sits at its edge. [describe] words the
/// range beside the label.
class RangeField extends StatelessWidget {
  const RangeField({
    super.key,
    required this.label,
    required this.bounds,
    required this.min,
    required this.max,
    required this.onChanged,
    this.describe,
  });

  final String? label;
  final RangeBounds bounds;
  final int? min;
  final int? max;
  final void Function(int? min, int? max) onChanged;
  final String Function(RangeLabel label)? describe;

  @override
  Widget build(BuildContext context) {
    final rangeLabel = RangeLabel.of(min, max);
    final described = describe?.call(rangeLabel) ?? rangeText(context.t, rangeLabel);

    final slider = RemixRangeSlider(
      values: [lowOf(bounds, min).toDouble(), highOf(bounds, max).toDouble()],
      min: bounds.floor.toDouble(),
      max: bounds.ceiling.toDouble(),
      snapDivisions: bounds.ceiling - bounds.floor,
      style: sliderStyle(),
      onChanged: (values) {
        onChanged(lowValue(bounds, values.first.round()), highValue(bounds, values.last.round()));
      },
    );

    return LabeledField(label: label ?? '', trailing: described, child: slider);
  }
}
