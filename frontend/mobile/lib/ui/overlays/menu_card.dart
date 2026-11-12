import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';

/// A card over the dimmed page, near its top: a title, a subtitle and a list of entries. Closes
/// with ×, the barrier or back.
Future<void> showMenuCard(
  BuildContext context, {
  required String title,
  String? subtitle,
  required WidgetBuilder builder,
}) {
  return showFDialog<void>(
    context: context,
    barrierLabel: context.t.ui.actions.close,
    builder: (dialogContext, _, animation) => FadeTransition(
      opacity: animation,
      child: SafeArea(
        child: Align(
          alignment: const Alignment(0, -0.6),
          child: Padding(
            padding: const EdgeInsets.all(AppSpaces.page),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpaces.spacing),
              decoration: BoxDecoration(
                color: dialogContext.theme.colors.background,
                borderRadius: dialogContext.theme.style.borderRadius.lg,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                spacing: 8,
                children: [
                  Row(
                    children: [
                      Expanded(child: Text(title, style: dialogContext.headingText)),
                      FButton.icon(
                        variant: .ghost,
                        semanticsLabel: dialogContext.t.ui.actions.close,
                        onPress: () => Navigator.of(dialogContext).pop(),
                        child: const Icon(FLucideIcons.x),
                      ),
                    ],
                  ),
                  if (subtitle != null)
                    Text(
                      subtitle,
                      style: dialogContext.headingText.copyWith(fontSize: dialogContext.bodyText.fontSize),
                    ),
                  builder(dialogContext),
                ],
              ),
            ),
          ),
        ),
      ),
    ),
  );
}
