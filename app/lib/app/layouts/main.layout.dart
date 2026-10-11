import 'package:aventurette/app/i18n.dart';
import 'package:aventurette/features/activities/routes.dart' as activities;
import 'package:aventurette/features/user/routes.dart' as user;
import 'package:aventurette/ui/layout/navbar.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

/// Navbar on top, the dock below, the page in between.
class MainLayout extends StatelessWidget {
  const MainLayout({super.key, required this.state, required this.child});

  final GoRouterState state;
  final Widget child;

  void _goBack(BuildContext context) {
    // Opened from a link, there is nothing to pop: land on the Ludotech instead.
    if (context.canPop()) {
      context.pop();
      return;
    }
    context.goNamed(activities.routesNames.all);
  }

  @override
  Widget build(BuildContext context) {
    // The dock's home: nothing to go back to from there.
    final canGoBack = state.topRoute?.name != activities.routesNames.all;

    return Scaffold(
      appBar: AppBar(
        leading: canGoBack
            ? IconButton(
                tooltip: context.t('back'),
                icon: const Icon(LucideIcons.arrowLeft),
                onPressed: () => _goBack(context),
              )
            : null,
        title: ValueListenableBuilder(
          valueListenable: navbarTitle,
          builder: (context, title, _) => Text(title ?? ''),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.user),
            onPressed: () => context.goNamed(user.routesNames.settings),
          ),
        ],
      ),
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        destinations: [
          NavigationDestination(icon: const Icon(LucideIcons.library), label: context.t('dock.ludotech')),
          // XXX : no search or tips page for the public yet.
          NavigationDestination(
            enabled: false,
            icon: const Icon(LucideIcons.search),
            label: context.t('dock.search'),
          ),
          NavigationDestination(
            enabled: false,
            icon: const Icon(LucideIcons.lightbulb),
            label: context.t('dock.tips'),
          ),
        ],
        onDestinationSelected: (_) => context.goNamed(activities.routesNames.all),
      ),
    );
  }
}
