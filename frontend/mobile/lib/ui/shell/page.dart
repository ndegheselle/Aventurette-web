/// The frame of a screen: its header, its body and its sticky actions.
library;

import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';

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
      color: context.theme.colors.background,
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
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpaces.page, 12, AppSpaces.page, 8),
      child: Row(
        spacing: 8,
        children: [
          Expanded(child: Text(title, style: context.titleText)),
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
    return Padding(
      padding: const EdgeInsets.fromLTRB(AppSpaces.page - 8, 8, AppSpaces.page, 8),
      child: Row(
        spacing: 4,
        children: [
          FButton.icon(
            variant: .ghost,
            semanticsLabel: context.t.ui.actions.back,
            onPress: onBack ?? () => Navigator.of(context).maybePop(),
            child: const Icon(FLucideIcons.chevronLeft),
          ),
          Expanded(child: Text(title, style: context.headingText, maxLines: 1, overflow: TextOverflow.ellipsis)),
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
    final colors = context.theme.colors;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: AppSpaces.page, vertical: 12),
      decoration: BoxDecoration(
        color: colors.background,
        border: Border(top: BorderSide(color: colors.border, width: context.theme.style.borderWidth)),
      ),
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
    return SingleChildScrollView(
      controller: controller,
      padding: const EdgeInsets.fromLTRB(AppSpaces.page, 4, AppSpaces.page, AppSpaces.page),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: AppSpaces.spacing,
        children: children,
      ),
    );
  }
}
