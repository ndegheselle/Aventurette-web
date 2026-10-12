import 'package:aventurette/app/i18n.dart';
import 'package:aventurette/ui/layout/navbar.dart';
import 'package:flutter/material.dart';

/// The signed-in user's landing page. Placeholder tiles until it has something to show.
class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    final tile = Theme.of(context).colorScheme.surfaceContainerHighest;

    return NavbarTitle(
      title: context.t('dashboard.title'),
      child: GridView.count(
        crossAxisCount: 2,
        padding: const EdgeInsets.all(8),
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
        children: [
          for (var i = 0; i < 6; i++)
            DecoratedBox(
              decoration: BoxDecoration(color: tile, borderRadius: BorderRadius.circular(12)),
            ),
        ],
      ),
    );
  }
}
