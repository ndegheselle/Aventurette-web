import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';

/// Opens a bottom sheet over the current page and resolves to what it was closed with: the
/// sheet owns a promise, as `<Modal>` does on the web. Closing it any other way — ×, the
/// barrier, a swipe down, back — resolves to null.
Future<T?> showAppSheet<T>(
  BuildContext context, {
  required String title,
  required WidgetBuilder builder,
  WidgetBuilder? actionsBuilder,
}) {
  return showFSheet<T>(
    context: context,
    side: .btt,
    useRootNavigator: true,
    mainAxisMaxRatio: 0.85,
    barrierLabel: context.t.ui.actions.close,
    builder: (sheetContext) =>
        _Sheet(title: title, body: builder(sheetContext), actions: actionsBuilder?.call(sheetContext)),
  );
}

class _Sheet extends StatelessWidget {
  const _Sheet({required this.title, required this.body, this.actions});

  final String title;
  final Widget body;
  final Widget? actions;

  @override
  Widget build(BuildContext context) {
    const gutter = AppSpaces.page;
    final radius = context.theme.style.borderRadius.lg.topLeft;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: context.theme.colors.background,
        borderRadius: BorderRadius.only(topLeft: radius, topRight: radius),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(gutter, 12, gutter - 8, 4),
              child: Row(
                children: [
                  Expanded(child: Text(title, style: context.headingText)),
                  FButton.icon(
                    variant: .ghost,
                    semanticsLabel: context.t.ui.actions.close,
                    onPress: () => Navigator.of(context).pop(),
                    child: const Icon(FLucideIcons.x),
                  ),
                ],
              ),
            ),
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(gutter, 4, gutter, gutter),
                child: body,
              ),
            ),
            if (actions != null) Padding(padding: const EdgeInsets.fromLTRB(gutter, 0, gutter, 12), child: actions),
          ],
        ),
      ),
    );
  }
}
