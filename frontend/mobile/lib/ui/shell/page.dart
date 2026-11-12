/// The frame of a screen: its header, its body and its sticky actions.
library;

import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/app_theme.dart';
import 'package:ajil/ui/theme/styles.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:remix/remix.dart';

/// A screen: the page colour, the safe area, a header, the body and an optional action bar.
class AppPage extends StatelessWidget {
  const AppPage({super.key, required this.header, required this.body, this.actions});

  final Widget header;
  final Widget body;

  /// Stays at the bottom while the body scrolls. See [BottomActionBar].
  final Widget? actions;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: context.token(AppColors.base0),
      child: SafeArea(
        bottom: actions != null,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            header,
            Expanded(child: body),
            ?actions,
          ],
        ),
      ),
    );
  }
}

/// The two buttons every tab page's header ends with — quick mode and the profile menu. The app
/// shell provides them, so a tab page needs to know neither feature behind them.
class TabHeaderActions extends InheritedWidget {
  const TabHeaderActions({super.key, required this.actions, required super.child});

  final List<Widget> actions;

  static List<Widget> of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<TabHeaderActions>()?.actions ?? const [];

  @override
  bool updateShouldNotify(TabHeaderActions oldWidget) => actions != oldWidget.actions;
}

/// A tab page's header: its title, large, and the shell's actions.
class TabHeader extends StatelessWidget {
  const TabHeader({super.key, required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    final gutter = context.token(AppSpaces.page);

    return Padding(
      padding: EdgeInsets.fromLTRB(gutter, 12, gutter, 8),
      child: Row(
        spacing: 8,
        children: [
          Expanded(child: StyledText(title, style: titleText())),
          ...TabHeaderActions.of(context),
        ],
      ),
    );
  }
}

/// A full-screen view's header: back, and its title. [onBack] defaults to popping the route.
class BackHeader extends StatelessWidget {
  const BackHeader({super.key, required this.title, this.onBack, this.trailing = const []});

  final String title;
  final VoidCallback? onBack;
  final List<Widget> trailing;

  @override
  Widget build(BuildContext context) {
    final gutter = context.token(AppSpaces.page);

    return Padding(
      padding: EdgeInsets.fromLTRB(gutter - 8, 8, gutter, 8),
      child: Row(
        spacing: 4,
        children: [
          RemixIconButton(
            icon: LucideIcons.chevronLeft,
            semanticLabel: context.t.ui.actions.back,
            style: iconButtonStyle().color(const Color(0x00000000)),
            onPressed: onBack ?? () => Navigator.of(context).maybePop(),
          ),
          Expanded(child: StyledText(title, style: headingText().fontSize(AppSizes.fontLg()).maxLines(1))),
          ...trailing,
        ],
      ),
    );
  }
}

/// The actions at the bottom of a screen, above the safe area, on a line over the content.
/// [children] are laid out by the caller: a [Row] of buttons, two rows for 2 × 2.
class BottomActionBar extends StatelessWidget {
  const BottomActionBar({super.key, required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final gutter = context.token(AppSpaces.page);

    return Box(
      style: BoxStyler()
          .color(AppColors.base0())
          .border(BoxBorderMix.top(BorderSideMix(color: AppColors.display.border0(), width: AppSizes.thickness())))
          .padding(EdgeInsetsGeometryMix.symmetric(horizontal: gutter, vertical: 12)),
      child: Column(mainAxisSize: MainAxisSize.min, spacing: 8, children: children),
    );
  }
}

/// A page body that scrolls, with the gutter on both sides and a gap between its children.
class PageScroll extends StatelessWidget {
  const PageScroll({super.key, required this.children, this.controller});

  final List<Widget> children;
  final ScrollController? controller;

  @override
  Widget build(BuildContext context) {
    final gutter = context.token(AppSpaces.page);

    return SingleChildScrollView(
      controller: controller,
      padding: EdgeInsets.fromLTRB(gutter, 4, gutter, gutter),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: context.token(AppSpaces.spacing),
        children: children,
      ),
    );
  }
}
