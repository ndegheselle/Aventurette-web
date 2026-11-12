import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';

/// One row of pills, one of them selected: used both for tabs (*Toutes · Favoris…*) and for a
/// single choice in a form (*Petit jeu · Grand jeu…*), since the wireframes draw them alike.
/// On one line that scrolls sideways, or wrapped onto several with [wrap].
class PillTabs<T> extends StatelessWidget {
  const PillTabs({
    super.key,
    required this.values,
    required this.selected,
    required this.labelOf,
    required this.onChanged,
    this.wrap = false,
  });

  final List<T> values;
  final T? selected;
  final String Function(T value) labelOf;
  final ValueChanged<T> onChanged;
  final bool wrap;

  @override
  Widget build(BuildContext context) {
    final pills = [
      for (final value in values)
        _Pill(label: labelOf(value), selected: value == selected, onPressed: () => onChanged(value)),
    ];

    return _PillLayout(wrap: wrap, children: pills);
  }
}

/// Pills any number of which may be chosen: places, formats, needs.
class MultiPills<T> extends StatelessWidget {
  const MultiPills({
    super.key,
    required this.values,
    required this.selected,
    required this.labelOf,
    required this.onToggled,
    this.wrap = true,
  });

  final List<T> values;
  final Set<T> selected;
  final String Function(T value) labelOf;
  final ValueChanged<T> onToggled;
  final bool wrap;

  @override
  Widget build(BuildContext context) {
    final pills = [
      for (final value in values)
        _Pill(label: labelOf(value), selected: selected.contains(value), onPressed: () => onToggled(value)),
    ];

    return _PillLayout(wrap: wrap, children: pills);
  }
}

/// [values] with [value] taken off if it was in it, added at the end otherwise.
List<T> toggled<T>(List<T> values, T value) => values.contains(value)
    ? [
        for (final other in values)
          if (other != value) other,
      ]
    : [...values, value];

class _PillLayout extends StatelessWidget {
  const _PillLayout({required this.wrap, required this.children});

  final bool wrap;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    if (wrap) return Wrap(spacing: 8, runSpacing: 8, children: children);

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(spacing: 8, children: children),
    );
  }
}

/// A button rounded into a pill, for a tab or a chip. Selected is the primary.
final FButtonStyleDelta pillStyle = .delta(
  decoration: .delta([.all(.boxDelta(borderRadius: BorderRadius.all(Radius.circular(999))))]),
);

class _Pill extends StatelessWidget {
  const _Pill({required this.label, required this.selected, required this.onPressed});

  final String label;
  final bool selected;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      selected: selected,
      child: FButton(
        variant: selected ? .primary : .outline,
        size: .sm,
        style: pillStyle,
        mainAxisSize: MainAxisSize.min,
        onPress: onPressed,
        child: Text(label),
      ),
    );
  }
}
