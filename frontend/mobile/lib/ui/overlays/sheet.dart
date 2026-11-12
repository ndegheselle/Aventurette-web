import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/app_theme.dart';
import 'package:ajil/ui/theme/styles.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:remix/remix.dart';

/// Opens a bottom sheet over the current page and resolves to what it was closed with: the
/// sheet owns a promise, as `<Modal>` does on the web. Closing it any other way — ×, the
/// barrier, back — resolves to null.
///
/// Our own route: `showModalBottomSheet` is Material.
Future<T?> showAppSheet<T>(
  BuildContext context, {
  required String title,
  required WidgetBuilder builder,
  WidgetBuilder? actionsBuilder,
}) {
  return Navigator.of(context, rootNavigator: true).push(
    _SheetRoute<T>(
      barrierLabel: context.t.ui.actions.close,
      builder: (sheetContext) =>
          _Sheet(title: title, body: builder(sheetContext), actions: actionsBuilder?.call(sheetContext)),
    ),
  );
}

class _SheetRoute<T> extends PopupRoute<T> {
  _SheetRoute({required this.builder, required this.barrierLabel});

  final WidgetBuilder builder;

  @override
  final String barrierLabel;

  @override
  Color get barrierColor => const Color(0x66000000);

  @override
  bool get barrierDismissible => true;

  @override
  Duration get transitionDuration => const Duration(milliseconds: 250);

  @override
  Widget buildPage(BuildContext context, Animation<double> animation, Animation<double> secondaryAnimation) =>
      Align(alignment: Alignment.bottomCenter, child: builder(context));

  @override
  Widget buildTransitions(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    final curved = CurvedAnimation(parent: animation, curve: Curves.easeOutCubic);
    return SlideTransition(
      position: Tween(begin: const Offset(0, 1), end: Offset.zero).animate(curved),
      child: child,
    );
  }
}

class _Sheet extends StatelessWidget {
  const _Sheet({required this.title, required this.body, this.actions});

  final String title;
  final Widget body;
  final Widget? actions;

  @override
  Widget build(BuildContext context) {
    final gutter = context.token(AppSpaces.page);
    final radius = context.token(AppRadii.display);
    final maxHeight = MediaQuery.sizeOf(context).height * 0.85;
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return Padding(
      // Rises above the keyboard when a field inside it has focus.
      padding: EdgeInsets.only(bottom: bottomInset),
      child: ConstrainedBox(
        constraints: BoxConstraints(maxHeight: maxHeight),
        child: Box(
          style: BoxStyler()
              .width(double.infinity)
              .color(AppColors.display.base0())
              .borderRadius(BorderRadiusGeometryMix.only(topLeft: radius, topRight: radius)),
          child: SafeArea(
            top: false,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Padding(
                  padding: EdgeInsets.fromLTRB(gutter, 12, gutter - 8, 4),
                  child: Row(
                    children: [
                      Expanded(child: StyledText(title, style: headingText())),
                      RemixIconButton(
                        icon: LucideIcons.x,
                        semanticLabel: context.t.ui.actions.close,
                        style: iconButtonStyle().color(const Color(0x00000000)),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                ),
                Flexible(
                  child: SingleChildScrollView(padding: EdgeInsets.fromLTRB(gutter, 4, gutter, gutter), child: body),
                ),
                if (actions != null) Padding(padding: EdgeInsets.fromLTRB(gutter, 0, gutter, 12), child: actions),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
