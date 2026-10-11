import 'package:flutter/material.dart';

/// The outermost element of a page: scrolls, and keeps its content off the screen's edges.
class PageContainer extends StatelessWidget {
  const PageContainer({super.key, required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 1100),
        child: ListView(
          padding: const EdgeInsets.all(8),
          children: [
            for (final child in children) Padding(padding: const EdgeInsets.only(bottom: 8), child: child),
          ],
        ),
      ),
    );
  }
}
