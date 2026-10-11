import 'package:flutter/material.dart';

/// Groups related elements on a visible background.
class Panel extends StatelessWidget {
  const Panel({super.key, required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, spacing: 8, children: children),
      ),
    );
  }
}
