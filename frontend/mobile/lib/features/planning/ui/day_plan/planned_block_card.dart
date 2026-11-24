import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';

/// A planned block's card: its label, and its time under it. The same on the day plan's
/// timeline, where it fills the height of its time, and on the planning. A block the user named
/// is drawn on the page's background with a clock, to tell it from an activity.
class PlannedBlockCard extends StatelessWidget {
  const PlannedBlockCard({
    super.key,
    required this.label,
    required this.time,
    this.isActivity = true,
    this.highlighted = false,
    this.onTap,
  });

  final String label;

  /// *9h30–10h15*, or with its day where the planning shows several.
  final String time;

  /// False for a block the user named.
  final bool isActivity;

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
          color: isActivity ? colors.secondary : colors.background,
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
                Row(
                  spacing: 4,
                  children: [
                    if (!isActivity) Icon(FLucideIcons.clock, size: 14, color: colors.mutedForeground),
                    Expanded(
                      child: Text(label, style: context.labelText, maxLines: 1, overflow: TextOverflow.ellipsis),
                    ),
                  ],
                ),
                Text(time, style: context.captionText, maxLines: 1),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
