import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/inputs/fields.dart';
import 'package:ajil/core/range.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';

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

    final slider = FSlider(
      control: .liftedDiscreteRange(
        value: FSliderValue(
          min: fractionOf(bounds, lowOf(bounds, min)),
          max: fractionOf(bounds, highOf(bounds, max)),
        ),
        onChange: (value) => onChanged(
          lowValue(bounds, valueAt(bounds, value.min)),
          highValue(bounds, valueAt(bounds, value.max)),
        ),
      ),
      // A discrete slider stops on its marks only: one per whole value.
      marks: [
        for (var value = bounds.floor; value <= bounds.ceiling; value++)
          FSliderMark(value: fractionOf(bounds, value), tick: false),
      ],
      tooltipBuilder: (_, fraction) => Text('${valueAt(bounds, fraction)}'),
      semanticValueFormatterCallback: (fraction) => '${valueAt(bounds, fraction)}',
    );

    return LabeledField(label: label ?? '', trailing: described, child: slider);
  }
}
