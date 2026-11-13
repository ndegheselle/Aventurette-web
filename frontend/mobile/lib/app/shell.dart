import 'package:ajil/features/activities/ui/quick_mode_button.dart';
import 'package:ajil/features/user/ui/me/me_button.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';
import 'package:go_router/go_router.dart';

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
        FBottomNavigationBar(
          index: shell.currentIndex,
          safeAreaBottom: true,
          // Tapping the current tab goes back to its root.
          onChange: (index) => shell.goBranch(index, initialLocation: index == shell.currentIndex),
          children: [
            FBottomNavigationBarItem(icon: const Icon(FLucideIcons.layoutGrid), label: Text(t.catalogue)),
            FBottomNavigationBarItem(icon: const Icon(FLucideIcons.calendarDays), label: Text(t.planning)),
            FBottomNavigationBarItem(icon: const Icon(FLucideIcons.plus), label: Text(t.create)),
            FBottomNavigationBarItem(icon: const Icon(FLucideIcons.clock), label: Text(t.followUp)),
            FBottomNavigationBarItem(icon: const Icon(FLucideIcons.target), label: Text(t.pedagogy)),
          ],
        ),
      ],
    );
  }
}
