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
    final colors = context.theme.colors;
    final style = context.theme.style;
    final radius = style.borderRadius.md;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.background,
        border: Border(top: BorderSide(color: colors.border, width: style.borderWidth)),
        borderRadius: BorderRadius.only(topLeft: radius.topLeft, topRight: radius.topRight),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Center(
                child: Container(
                  width: 40,
                  height: 6,
                  decoration: BoxDecoration(color: colors.border, borderRadius: radius),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(gutter - 8, 4, gutter - 8, 4),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Align(
                    alignment: Alignment.centerLeft,
                    child: FButton.icon(
                      variant: .ghost,
                      semanticsLabel: context.t.ui.actions.close,
                      onPress: () => Navigator.of(context).pop(),
                      child: const Icon(FLucideIcons.x, size: 18),
                    ),
                  ),
                  // The side padding keeps a long title clear of the close button.
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 48),
                    child: Text(
                      title,
                      style: context.titleText,
                      textAlign: TextAlign.center,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
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
