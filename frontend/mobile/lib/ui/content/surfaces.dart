/// The surfaces repeated on most screens: cards, notes, tags and the placeholders that stand in
/// for content not designed yet.
library;

import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';

/// A card: the display surface everything else sits on.
class Panel extends StatelessWidget {
  const Panel({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: double.infinity,
    child: FCard(
      style: const .delta(padding: .value(EdgeInsets.all(AppSpaces.spacing))),
      child: child,
    ),
  );
}

/// A card that opens something: a title followed by ›, and a line under it.
class LinkCard extends StatelessWidget {
  const LinkCard({super.key, required this.title, this.subtitle, this.leading, required this.onTap});

  final String title;
  final String? subtitle;
  final IconData? leading;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Panel(
          child: Row(
            spacing: AppSpaces.spacing,
            children: [
              if (leading != null) Icon(leading, color: context.theme.colors.mutedForeground),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  spacing: 2,
                  children: [
                    Text('$title  ›', style: context.headingText.copyWith(fontSize: context.bodyText.fontSize)),
                    if (subtitle != null) Text(subtitle!, style: context.captionText),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// The grey note under a screen's content: what a user should know about it.
class HintBox extends StatelessWidget {
  const HintBox(this.text, {super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpaces.spacing),
      decoration: BoxDecoration(
        color: context.theme.colors.muted,
        borderRadius: context.theme.style.borderRadius.lg,
      ),
      child: Text(text, style: context.captionText),
    );
  }
}

/// A small label: a duration, a place, a tag.
class Tag extends StatelessWidget {
  const Tag(this.label, {super.key});

  final String label;

  @override
  Widget build(BuildContext context) => FBadge(variant: .secondary, child: Text(label));
}

/// Where a picture goes until activities have one.
class ImagePlaceholder extends StatelessWidget {
  const ImagePlaceholder({super.key, this.height = 96, this.icon = FLucideIcons.image});

  final double height;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    final colors = context.theme.colors;

    return Container(
      height: height,
      width: double.infinity,
      color: colors.muted,
      alignment: Alignment.center,
      child: Icon(icon, size: 28, color: colors.mutedForeground),
    );
  }
}

/// Nothing to show yet: an icon and a sentence, centred.
class EmptyState extends StatelessWidget {
  const EmptyState({super.key, required this.icon, required this.message});

  final IconData icon;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: [
            Icon(icon, size: 40, color: context.theme.colors.mutedForeground),
            Text(
              message,
              style: context.captionText.copyWith(fontSize: context.bodyText.fontSize),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
