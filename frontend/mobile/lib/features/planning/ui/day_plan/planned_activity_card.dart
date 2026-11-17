import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';

/// A planned activity's card: its name, and its time under it. The same on the day plan's
/// timeline, where it fills the height of its time, and on the planning.
class PlannedActivityCard extends StatelessWidget {
  const PlannedActivityCard({super.key, required this.name, required this.time, this.highlighted = false, this.onTap});

  final String name;

  /// *9h30–10h15*, or with its day where the planning shows several.
  final String time;

  /// Outlined in the primary colour, while it is moved.
  final bool highlighted;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.theme.colors;

    return GestureDetector(
      onTap: onTap,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.secondary,
          border: Border.all(color: highlighted ? colors.primary : colors.border, width: highlighted ? 2 : 1),
          borderRadius: context.theme.style.borderRadius.md,
        ),
        child: ClipRect(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(name, style: context.labelText, maxLines: 1, overflow: TextOverflow.ellipsis),
                Text(time, style: context.captionText, maxLines: 1),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
