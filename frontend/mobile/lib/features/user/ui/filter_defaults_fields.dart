import 'package:ajil/core/range.dart';
import 'package:ajil/features/user/models/user.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/inputs/fields.dart';
import 'package:ajil/ui/inputs/pills.dart';
import 'package:ajil/ui/inputs/range_field.dart';
import 'package:flutter/widgets.dart';

/// How far the sliders go: ages in years, children in head count.
const ageBounds = RangeBounds(floor: 0, ceiling: 18);
const participantsBounds = RangeBounds(floor: 1, ceiling: 10);

/// The filter defaults' fields, for the onboarding and the preferences: the ages, the number of
/// children and the places.
class FilterDefaultsFields extends StatelessWidget {
  const FilterDefaultsFields({super.key, required this.defaults, required this.onChanged});

  final FilterDefaults defaults;
  final ValueChanged<FilterDefaults> onChanged;

  @override
  Widget build(BuildContext context) {
    final t = context.t.user;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 20,
      children: [
        RangeField(
          label: t.filterDefaults.age,
          bounds: ageBounds,
          min: defaults.ageMin,
          max: defaults.ageMax,
          onChanged: (min, max) => onChanged(defaults.copyWith(ageMin: () => min, ageMax: () => max)),
        ),
        RangeField(
          label: t.filterDefaults.participants,
          bounds: participantsBounds,
          min: defaults.participantsMin,
          max: defaults.participantsMax,
          onChanged: (min, max) => onChanged(defaults.copyWith(participantsMin: () => min, participantsMax: () => max)),
        ),
        LabeledField(
          label: t.filterDefaults.locations,
          child: MultiPills(
            values: Location.values,
            selected: defaults.locations.toSet(),
            labelOf: (location) => t.location[location.name]!,
            onToggled: (location) => onChanged(defaults.copyWith(locations: toggled(defaults.locations, location))),
          ),
        ),
      ],
    );
  }
}
