import 'package:flutter/material.dart';

/// A panel's heading: an icon, then the title.
class SectionTitle extends StatelessWidget {
  const SectionTitle(this.title, {super.key, this.icon});

  final String title;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Row(
      spacing: 8,
      children: [
        if (icon != null) Icon(icon),
        Expanded(child: Text(title, style: Theme.of(context).textTheme.titleLarge)),
      ],
    );
  }
}
