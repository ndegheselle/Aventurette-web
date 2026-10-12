import 'package:aventurette/app/i18n.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

/// For the screens reachable signed out: a home link on top, the page below.
class EmptyLayout extends StatelessWidget {
  const EmptyLayout({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          tooltip: context.t('home'),
          icon: const Icon(LucideIcons.house),
          onPressed: () => context.go('/'),
        ),
      ),
      body: child,
    );
  }
}
