import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/styles.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:remix/remix.dart';

/// A card over the dimmed page, near its top: a title, a subtitle and a list of entries. Closes
/// with ×, the barrier or back.
Future<void> showMenuCard(
  BuildContext context, {
  required String title,
  String? subtitle,
  required WidgetBuilder builder,
}) {
  return showRemixDialog<void>(
    context: context,
    barrierLabel: context.t.ui.actions.close,
    builder: (dialogContext) => SafeArea(
      child: Align(
        alignment: const Alignment(0, -0.6),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Box(
            style: BoxStyler()
                .width(double.infinity)
                .color(AppColors.display.base0())
                .borderRadius(BorderRadiusGeometryMix.all(AppRadii.display()))
                .padding(EdgeInsetsGeometryMix.all(AppSpaces.displayPadding())),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: 8,
              children: [
                Row(
                  children: [
                    Expanded(child: StyledText(title, style: headingText())),
                    RemixIconButton(
                      icon: LucideIcons.x,
                      semanticLabel: dialogContext.t.ui.actions.close,
                      style: iconButtonStyle().color(const Color(0x00000000)),
                      onPressed: () => Navigator.of(dialogContext).pop(),
                    ),
                  ],
                ),
                if (subtitle != null) StyledText(subtitle, style: headingText().fontSize(AppSizes.fontMd())),
                builder(dialogContext),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}
