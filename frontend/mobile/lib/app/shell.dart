import 'package:ajil/features/activities/ui/quick_mode_button.dart';
import 'package:ajil/features/user/ui/profile_menu.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/app_dock.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

/// The dock tabs' frame: the current tab above the dock. It gives every tab page's header its
/// two buttons, so no tab page has to know quick mode or the profile menu.
class AppShell extends StatelessWidget {
  const AppShell({super.key, required this.shell});

  final StatefulNavigationShell shell;

  @override
  Widget build(BuildContext context) {
    final t = context.t.app.dock;

    return Column(
      children: [
        Expanded(
          child: TabHeaderActions(actions: const [QuickModeButton(), ProfileMenuButton()], child: shell),
        ),
        AppDock(
          currentIndex: shell.currentIndex,
          // Tapping the current tab goes back to its root.
          onSelected: (index) => shell.goBranch(index, initialLocation: index == shell.currentIndex),
          items: [
            DockItem(icon: LucideIcons.layoutGrid, label: t.catalogue),
            DockItem(icon: LucideIcons.calendarDays, label: t.planning),
            DockItem(icon: LucideIcons.plus, label: t.create),
            DockItem(icon: LucideIcons.clock, label: t.followUp),
            DockItem(icon: LucideIcons.target, label: t.pedagogy),
          ],
        ),
      ],
    );
  }
}
